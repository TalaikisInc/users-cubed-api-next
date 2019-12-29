import { BASE_URL, COMPANY } from '../../config'
import { read } from '../../lib/db'
import { hash, randomID } from '../../lib/security'
import sendEmail from '../../lib/email'
import { t, setLocale } from '../../lib/translations'
import { confirmSchema } from './schema'
import { sendError, finalizeRequest } from '../../lib/utils'

const sendNewPassword = async (email, password, done) => {
  const subject = `${t('email_password')} ${COMPANY}`
  const msg = `${t('email_password')} <a href='${BASE_URL}'>${COMPANY}</a>:
    <h4>${password}</h4>`
  const e = await sendEmail(email, subject, msg).catch((e) => done(e))
  if (!e) {
    done(false)
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
        finalizeRequest('users', tokenData.email, 'update', done, userData)
      }
      done(err)
    })
  } else if (tokenData.type === 'email' || tokenData.type === 'phone') {
    userData.confirmed[tokenData.type] = true
    finalizeRequest('users', tokenData.email, 'update', done, userData)
  }
}

const _confirm = async (id, done) => {
  const tokenData = await read('confirms', id).catch(async () => await sendError(403, t('error.token_notfound'), done))
  if (tokenData.expiry > Date.now()) {
    if (tokenData.token === id) {
      const userData = await read('users', tokenData.email).catch(async () => await sendError(400, t('error.no_user'), done))
      await selectType(tokenData, userData, (status, data) => {
        done(status, data)
      })
    }
    await sendError(403, t('error.token_invalid'), done)
  }
  await sendError(403, t('error.token_expired'), done)
}

export default async (data, done) => {
  const valid = await confirmSchema.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    await _confirm(data.payload.token, (status, data) => {
      return { status, out: data }
    })
  } else {
    await sendError(400, t('error.required'), done)
  }
}
