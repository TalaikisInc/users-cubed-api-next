import { BASE_URL, COMPANY } from '../../config'
import db from '../../lib/db'
import { hash, randomID } from '../../lib/security'
import sendEmail from '../../lib/email'
import { t, setLocale } from '../../lib/translations'
import { confirmSchema } from './schema'
import { finalizeRequest } from '../../lib/utils'

const sendNewPassword = async (email, password, done) => {
  const subject = `${t('reset.email_password')} ${COMPANY}`
  const msg = `${t('reset.email_password')} <a href='${BASE_URL}'>${COMPANY}</a>:
    <h4>${password}</h4>`
  const e = await sendEmail(email, subject, msg).catch((e) => done(e))
  if (!e) {
    done()
  }
}

const selectType = async (tokenData, userData, done) => {
  if (tokenData.type === 'reset') {
    const password = await randomID(16).catch(() => done(t('error.generate')))
    const hashed = await hash(password).catch(() => done(t('error.hash')))
    userData.password = hashed
    userData.updatedAt = Date.now()
    await sendNewPassword(userData.email, password, (err) => {
      if (!err) {
        finalizeRequest('users', tokenData.email, 'update', userData, done)
      } else {
        done(err)
      }
    })
  } else if (tokenData.type === 'email' || tokenData.type === 'phone') {
    userData.confirmed[tokenData.type] = true
    finalizeRequest('users', tokenData.email, 'update', userData, done)
  }
}

export default async (data, final) => {
  const valid = await confirmSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const id = data.body.token
    const tokenData = await db.read('confirms', id).catch(() => final({ s: 403, e: t('error.token_notfound') }))
    if (tokenData.expiry > Date.now()) {
      if (tokenData.token === id) {
        const userData = await db.read('users', tokenData.email).catch(() => final({ s: 400, e: t('error.no_user') }))
        await selectType(tokenData, userData, (status, data) => {
          final(null, { s: status, o: data })
        })
      } else {
        final({ s: 403, e: t('error.token_invalid') })
      }
    } else {
      final({ s: 403, e: t('error.token_expired') })
    }
  } else {
    final({ s: 400, e: t('error.required') })
  }
}
