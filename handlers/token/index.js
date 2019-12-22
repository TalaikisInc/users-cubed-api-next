import { randomID, hash } from '../../lib/security'
import config from '../../config'
import { read, create } from '../../lib/db/functions'
import { user } from '../../lib/data/userObj'
import { createSchema, tokenGet, tokenExtend, tokenDestroy } from './schema'
import { t, setLocale } from '../../lib/translations'
import { sendError, finalizeRequest } from '../../lib/utils'

export const get = async (data, done) => {
  const valid = await tokenGet.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const tokenData = await read('tokens', data.payload.tokenId).catch(() => done(404, { error: t('error.token_notfound') }))
    done(200, tokenData)
  } else {
    await sendError(400, t('error.required'), done)
  }
}

const _hash = async (u, userData, done) => {
  const hashed = await hash(u.password).catch((e) => done(500, { error: t('error.internal') }))
  if (userData.password === hashed) {
    const tokenId = await randomID(32).catch(() => done(400, { error: t('error.id') }))
    const expiry = Date.now() + 1000 * config.tokenExpiry
    const tokenObj = {
      expiry,
      tokenId,
      role: userData.role,
      email: u.email
    }

    await create('tokens', tokenId, tokenObj).catch(() => done(500, { error: t('error.token') }))
    done(200, { token: tokenId })
  } else {
    done(401, { error: t('error.invalid_password') })
  }
}

export const gen = async (data, done) => {
  const valid = await createSchema.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const u = await user(data).catch(() => await sendError(400, t('error.required'), done))
    if ((u.email && u.password) || (u.phone && u.password)) {
      const userData = await read('users', u.email).catch((e) => done(400, { error: t('error.cannot_read') }))
      if (userData) {
        if (userData.confirmed.email || userData.confirmed.phone) {
          await _hash(u, userData, (status, out) => {
            done(status, out)
          })
        } else {
          done(400, { error: t('error.confirmed') })
        }
      } else {
        done(400, { error: t('error.no_user') })
      }
    } else {
      await sendError(400, t('error.required'), done)
    }
  } else {
    await sendError(400, t('error.required'), done)
  }
}

export const extend = async (data, done) => {
  const valid = await tokenExtend.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const id = data.payload.tokenId
    if (id) {
      const tokenData = await read('tokens', id).catch(() => done(400, { error: t('error.token_notfound') }))
      if (tokenData.expiry > Date.now()) {
        tokenData.expiry = Date.now() + 1000 * config.tokenExpiry
        finalizeRequest('tokens', id, 'update', done, tokenData)
      } else {
        done(400, { error: t('error.token_expired') })
      }
    } else {
      await sendError(400, t('error.required'), done)
    }
  } else {
    await sendError(400, t('error.required'), done)
  }
}

export const destroy = async (data, done) => {
  const valid = await tokenDestroy.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const token = data.payload.tokenId
    if (token) {
      await read('tokens', token).catch(() => done(404, { error: t('error.token_notfound') }))
      finalizeRequest('tokens', token, 'delete', done)
    } else {
      await sendError(400, t('error.required'), done)
    }
  } else {
    await sendError(400, t('error.required'), done)
  }
}
