import { randomID, hash, auth } from '../../lib/security'
import { USER_TOKEN_EXPIRY } from '../../config'
import db from '../../lib/db'
import { user } from '../../lib/schemas'
import { createSchema, tokenGet, tokenExtend, tokenDestroy } from './schema'
import { t, setLocale } from '../../lib/translations'
import { finalizeRequest } from '../../lib/utils'

export const get = async (data, final) => {
  const valid = await tokenGet.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const t = await db.read('tokens', data.body.tokenId).catch(() => final({ s: 403, e: t('error.token_notfound') }))
    final(null, { s: 200, o: { expiry: t.expiry, tokenId: t.tokenId, role: t.role, email: t.email } })
  } else {
    final({ s: 400, e: t('error.required') })
  }
}

const _hash = async (u, userData, done) => {
  const hashed = await hash(u.password).catch(() => done(t('error.internal')))
  if (userData.password === hashed) {
    const tokenId = await randomID(32).catch(() => done(t('error.id')))
    const expiry = Date.now() + 1000 * USER_TOKEN_EXPIRY
    const tokenObj = {
      expiry,
      tokenId,
      role: userData.role,
      email: u.email
    }

    await db.create('tokens', tokenId, tokenObj).catch(() => done(t('error.token')))
    done(null, tokenId)
  } else {
    done(t('error.invalid_password'))
  }
}

export const gen = async (data, final) => {
  const valid = await createSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const u = await user(data).catch(() => final({ s: 400, e: t('error.required') }))
    if ((u.email && u.password) || (u.phone && u.password)) {
      const userData = await db.read('users', u.email).catch(() => final({ s: 400, e: t('error.cannot_read') }))
      if (userData) {
        if (userData.confirmed.email || userData.confirmed.phone) {
          await _hash(u, userData, (e, tokenId) => {
            if (!e && tokenId) {
              final(null, { s: 200, o: { tokenId } })
            } else {
              final({ s: 400, e })
            }
          })
        } else {
          final({ s: 400, e: t('error.confirmed') })
        }
      } else {
        final({ s: 400, e: t('error.no_user') })
      }
    } else {
      final({ s: 400, e: t('error.required') })
    }
  } else {
    final({ s: 400, e: t('error.required') })
  }
}

export const extend = async (data, final) => {
  const valid = await tokenExtend.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const id = data.body.tokenId
    if (id) {
      const tokenData = await db.read('tokens', id).catch(() => final({ s: 400, e: t('error.token_notfound') }))
      if (tokenData.expiry > Date.now()) {
        tokenData.expiry = Date.now() + 1000 * USER_TOKEN_EXPIRY
        finalizeRequest('tokens', id, 'update', tokenData, final)
      } else {
        final({ s: 400, e: t('error.token_expired') })
      }
    } else {
      final({ s: 400, e: t('error.required') })
    }
  } else {
    final({ s: 400, e: t('error.required') })
  }
}

export const destroy = async (data, final) => {
  const valid = await tokenDestroy.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data)
    if (tokenData) {
      finalizeRequest('tokens', tokenData.tokenId, 'destroy', '', final)
    } else {
      final({ s: 400, e: t('error.required') })
    }
  } else {
    final({ s: 400, e: t('error.required') })
  }
}
