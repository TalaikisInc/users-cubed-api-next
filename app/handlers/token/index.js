import { randomID, hash } from '../../lib/security'
import { USER_TOKEN_EXPIRY } from '../../config'
import { read, create } from '../../lib/db'
import { user } from '../../lib/schemas'
import { createSchema, tokenGet, tokenExtend, tokenDestroy } from './schema'
import { t, setLocale } from '../../lib/translations'
import { sendErr, finalizeRequest } from '../../lib/utils'

export const get = async (data, done) => {
  const valid = await tokenGet.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const tokenData = await db.read('tokens', data.body.tokenId).catch(() => sendErr(403, t('error.token_notfound'), done))
    done(200, tokenData)
  }
  sendErr(400, t('error.required'), done)
}

const _hash = async (u, userData, done) => {
  const hashed = await hash(u.password).catch(() => sendErr(500, t('error.internal'), done))
  if (userData.password === hashed) {
    const tokenId = await randomID(32).catch(() => sendErr(500, t('error.id'), done))
    const expiry = Date.now() + 1000 * USER_TOKEN_EXPIRY
    const tokenObj = {
      expiry,
      tokenId,
      role: userData.role,
      email: u.email
    }

    await db.create('tokens', tokenId, tokenObj).catch(() => sendErr(400, t('error.token'), done))
    done(200, { token: tokenId })
  }
  sendErr(400, t('error.invalid_password'), done)
}

export const gen = async (data, done) => {
  const valid = await db.createSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const u = await user(data).catch(() => sendErr(400, t('error.required'), done))
    if ((u.email && u.password) || (u.phone && u.password)) {
      const userData = await db.read('users', u.email).catch(async (e) => sendErr(400, t('error.cannot_read'), done))
      if (userData) {
        if (userData.confirmed.email || userData.confirmed.phone) {
          await _hash(u, userData, (status, out) => {
            done(status, out)
          })
        }
        sendErr(400, t('error.confirmed'), done)
      }
      sendErr(400, t('error.no_user'), done)
    }
    sendErr(400, t('error.required'), done)
  }
  sendErr(400, t('error.required'), done)
}

export const extend = async (data, done) => {
  const valid = await tokenExtend.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const id = data.body.tokenId
    if (id) {
      const tokenData = await db.read('tokens', id).catch(() => sendErr(400, t('error.token_notfound'), done))
      if (tokenData.expiry > Date.now()) {
        tokenData.expiry = Date.now() + 1000 * USER_TOKEN_EXPIRY
        finalizeRequest('tokens', id, 'update', tokenData, done)
      }
      sendErr(400, t('error.token_expired'), done)
    }
    sendErr(400, t('error.required'), done)
  }
  sendErr(400, t('error.required'), done)
}

export const destroy = async (data, done) => {
  const valid = await tokenDestroy.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const token = data.body.tokenId
    if (token) {
      await db.read('tokens', token).catch(() => sendErr(400, t('error.token_notfound'), done))
      finalizeRequest('tokens', token, 'delete', {}, done)
    }
    sendErr(400, t('error.required'), done)
  }
  sendErr(400, t('error.required'), done)
}
