import { promisify } from 'util'

import { BASE_URL, COMPANY } from '../../config'
import db from '../../lib/db'
import sendEmail from '../../lib/email'
import { uuidv4, tokenHeader } from '../../lib/security'
import { t, setLocale } from '../../lib/translations'
import { referSchema, useSchema, registerSchema } from './schema'
import { finalizeRequest, validEmail } from '../../lib/utils'

const _generateToken = async (email, done) => {
  const token = uuidv4()
  const obj = {
    id: token,
    referral: email,
    used: false,
    finalized: false
  }

  await db.create('refers', token, obj).catch(() => done(t('error.save')))
  done(null, token)
}

const generateToken = promisify(_generateToken)

const sendReferEmail = async (email, token, referringUser) => {
  const subject = `${referringUser} is inviting you to join ${COMPANY}`
  const msg = t('refer.email', { baseUrl: BASE_URL, token: token })
  const e = await sendEmail(email, subject, msg).catch((e) => e)
  if (!e) {
    return false
  }
}

const tokenResponse = async (tokenData, userData, refEmail, final) => {
  const refToken = await generateToken(tokenData.email).catch((e) => final(null, { s: 400, e }))
  if (refToken) {
    userData.referred.push(refToken)
    userData.updatedAt = Date.now()
    const referringUser = `${userData.firstName} ${userData.lastName} <${tokenData.email}>`
    const sent = await sendReferEmail(refEmail, refToken, referringUser).catch((e) => final(null, { s: 400, e }))
    if (sent) {
      finalizeRequest('users', tokenData.email, 'update', userData, final)
    } else {
      final(null, { s: 400, e: t('error.refer_email') })
    }
  } else {
    final(null, { s: 400, e: t('error.id') })
  }
}

/**
  * @desc Referring user sends email to friend
  * @param object data - { headers: ( token: 'Bearer ...' ), phone: ..., to: ... }
  * @return bool - success or failure with optional error object
*/
export const refer = async (data, final) => {
  const valid = await referSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const token = await tokenHeader(data).catch(() => final(null, { s: 403, e: t('error.wrong_token') }))
    const tokenData = await db.read('tokens', token).catch(() => final(null, { s: 403, e: t('error.cannot_read') }))
    const validRef = await validEmail(data.body.to)
      .catch((e) => e)
    if (tokenData.email && validRef && data.body.to !== tokenData.email) {
      const userData = await db.read('users', tokenData.email).catch(() => final(null, { s: 400, e: t('error.cannot_read') }))
      if (userData) {
        await tokenResponse(tokenData, userData, data.body.to)
      }
    } else {
      final(null, { s: 400, e: t('error.required') })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

/**
  * @desc Referred user clicks his link
  * @param object data - { token: .... }
  * @return bool - success or failure with optional error object
*/
export const use = async (data, final) => {
  const valid = await useSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const token = typeof data.body.token === 'string' && data.body.token.length === 36 ? data.body.token : false
    if (token) {
      const refData = await db.read('refers', token).catch(() => final(null, { s: 403, e: t('error.token_notfound') }))
      refData.used = true
      finalizeRequest('refers', token, 'update', refData, final)
    } else {
      final(null, { s: 400, e: t('error.required') })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

/**
  * @desc After referred user registration we update refer object
  * @param object data - { token: ...., phone: ... }
  * @return bool - success or failure with optional error object
*/
export const register = async (data, final) => {
  const valid = await registerSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const token = typeof data.body.token === 'string' && data.body.token.length === 36 ? data.body.token : false
    const email = data.body.from
    if (token && email) {
      const userData = await db.read('users', email).catch(() => final(null, { s: 400, e: t('error.no_user') }))
      const tokenData = await db.read('refers', token).catch(() => final(null, { s: 400, e: t('error.token_notfound') }))
      if (!userData.referred.includes(token)) {
        userData.referred.push(token)
        userData.updatedAt = Date.now()
        await db.update('users', email, userData).catch(() => final(null, { s: 500, e: t('error.cannot_update') }))
        tokenData.finalized = true
        finalizeRequest('refers', token, 'update', tokenData, final)
      }
    } else {
      final(null, { s: 400, e: t('error.required') })
    }
  }
}
