import { randomID, hash } from '../../lib/security'
import { USER_TOKEN_EXPIRY } from '../../config'
import { read, create } from '../../lib/db'
import { user } from '../../lib/schemas'
import { createSchema, tokenGet, tokenExtend, tokenDestroy } from './schema'
import { t, setLocale } from '../../lib/translations'
import { sendError, finalizeRequest } from '../../lib/utils'

export const get = async (data, done) => {
  const valid = await tokenGet.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const tokenData = await read('tokens', data.payload.tokenId).catch(async () => await sendError(403, t('error.token_notfound'), done))
    done(200, tokenData)
  }
  await sendError(400, t('error.required'), done)
}

const _hash = async (u, userData, done) => {
  const hashed = await hash(u.password).catch(async () => await sendError(500, t('error.internal'), done))
  if (userData.password === hashed) {
    const tokenId = await randomID(32).catch(async () => await sendError(500, t('error.id'), done))
    const expiry = Date.now() + 1000 * USER_TOKEN_EXPIRY
    const tokenObj = {
      expiry,
      tokenId,
      role: userData.role,
      email: u.email
    }

    await create('tokens', tokenId, tokenObj).catch(async () => await sendError(400, t('error.token'), done))
    done(200, { token: tokenId })
  }
  await sendError(400, t('error.invalid_password'), done)
}

export const gen = async (data, done) => {
  const valid = await createSchema.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const u = await user(data).catch(async () => await sendError(400, t('error.required'), done))
    if ((u.email && u.password) || (u.phone && u.password)) {
      const userData = await read('users', u.email).catch(async (e) => await sendError(400, t('error.cannot_read'), done))
      if (userData) {
        if (userData.confirmed.email || userData.confirmed.phone) {
          await _hash(u, userData, (status, out) => {
            done(status, out)
          })
        }
        await sendError(400, t('error.confirmed'), done)
      }
      await sendError(400, t('error.no_user'), done)
    }
    await sendError(400, t('error.required'), done)
  }
  await sendError(400, t('error.required'), done)
}

export const extend = async (data, done) => {
  const valid = await tokenExtend.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const id = data.payload.tokenId
    if (id) {
      const tokenData = await read('tokens', id).catch(async () => await sendError(400, t('error.token_notfound'), done))
      if (tokenData.expiry > Date.now()) {
        tokenData.expiry = Date.now() + 1000 * USER_TOKEN_EXPIRY
        finalizeRequest('tokens', id, 'update', done, tokenData)
      }
      await sendError(400, t('error.token_expired'), done)
    }
    await sendError(400, t('error.required'), done)
  }
  await sendError(400, t('error.required'), done)
}

export const destroy = async (data, done) => {
  const valid = await tokenDestroy.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const token = data.payload.tokenId
    if (token) {
      await read('tokens', token).catch(async () => await sendError(400, t('error.token_notfound'), done))
      finalizeRequest('tokens', token, 'delete', done)
    }
    await sendError(400, t('error.required'), done)
  }
  await sendError(400, t('error.required'), done)
}
