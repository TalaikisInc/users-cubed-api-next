import { promisify } from 'util'

import config from '../../config'
import { create, read, update } from '../../lib/db/functions'
import sendEmail from '../../lib/email'
import { uuidv4, tokenHeader } from '../../lib/security'
import { t, setLocale } from '../../lib/translations'
import { referSchema, useSchema, registerSchema } from './schema'
import { sendError, finalizeRequest, validEmail } from '../../lib/utils'

const _generateToken = async (email, done) => {
  const token = uuidv4()
  const obj = {
    id: token,
    referral: email,
    used: false,
    finalized: false
  }

  await create('refers', token, obj)
    .catch(() => done(t('error.save')))
  done(null, token)
}

const sendReferEmail = async (email, token, referringUser) => {
  const subject = `${referringUser} is inviting you to join ${config.company}`
  const msg = t('refer_email', { baseUrl: config.baseUrl, token: token })
  const e = await sendEmail(email, subject, msg)
    .catch((e) => e)
  if (!e) {
    return false
  }
}

const generateToken = promisify(_generateToken)

const tokenResponse = async (tokenData, userData, refEmail, done) => {
  const refToken = await generateToken(tokenData.email)
    .catch((e) => sendError(400, e, done))
  if (refToken) {
    userData.referred.push(refToken)
    userData.updatedAt = Date.now()
    const referringUser = `${userData.firstName} ${userData.lastName} <${tokenData.email}>`
    const sent = await sendReferEmail(refEmail, refToken, referringUser)
      .catch((e) => sendError(400, e, done))
    if (sent) {
      finalizeRequest('users', tokenData.email, 'update', done, userData)
    }
    await sendError(400, t('error.refer_email'), done)
  }
  await sendError(400, t('error.id'), done)
}

/**
  * @desc Referring user sends email to friend
  * @param object data - { headers: ( token: 'Bearer ...' ), phone: ..., to: ... }
  * @return bool - success or failure with optional error object
*/
export const refer = async (data, done) => {
  const valid = await referSchema.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const token = await tokenHeader(data)
      .catch(() => sendError(403, t('error.wrong_token'), done))
    const tokenData = await read('tokens', token)
      .catch(() => sendError(403, t('error.cannot_read'), done))
    const validRef = await validEmail(data.payload.to)
      .catch((e) => e)
    if (tokenData.email && validRef && data.payload.to !== tokenData.email) {
      const userData = await read('users', tokenData.email)
        .catch(() => sendError(400, t('error.cannot_read'), done))
      if (userData) {
        await tokenResponse(tokenData, userData, data.payload.to)
      }
    }
    await sendError(400, t('error.required'), done)
  }
  await sendError(400, t('error.required'), done)
}

/**
  * @desc Referred user clicks his link
  * @param object data - { token: .... }
  * @return bool - success or failure with optional error object
*/
export const use = async (data, done) => {
  const valid = await useSchema.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const token = typeof data.payload.token === 'string' && data.payload.token.length === 36 ? data.payload.token : false
    if (token) {
      const refData = await read('refers', token)
        .catch(() => sendError(403, t('error.token_notfound'), done))
      refData.used = true
      finalizeRequest('refers', token, 'update', done, refData)
    }
    await sendError(400, t('error.required'), done)
  }
  await sendError(400, t('error.required'), done)
}

/**
  * @desc After referred user registration we update refer object
  * @param object data - { token: ...., phone: ... }
  * @return bool - success or failure with optional error object
*/
export const register = async (data, done) => {
  const valid = await registerSchema.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const token = typeof data.payload.token === 'string' && data.payload.token.length === 36 ? data.payload.token : false
    const email = data.payload.from
    if (token && email) {
      const userData = await read('users', email)
        .catch(() => sendError(400, t('error.no_user'), done))
      const tokenData = await read('refers', token)
        .catch(() => sendError(400, t('error.token_notfound'), done))
      if (!userData.referred.includes(token)) {
        userData.referred.push(token)
        userData.updatedAt = Date.now()
        await update('users', email, userData)
          .catch(() => sendError(500, t('error.cannot_update'), done))
        tokenData.finalized = true
        finalizeRequest('refers', token, 'update', done, tokenData)
      }
    }
    await sendError(400, t('error.required'), done)
  }
}