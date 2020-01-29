import http from 'http'
import https from 'https'
import { stringify } from 'querystring'
import legit from 'legit'
import { promisify } from 'util'
import isEmail from 'validator/lib/isEmail'
import normalizeEmail from 'validator/lib/normalizeEmail'
import isMobilePhone from 'validator/lib/isMobilePhone'
import isISO8601 from 'validator/lib/isISO8601'
import isUrl from 'validator/lib/isURL'

import db from '../db'
import { t } from '../translations'

export const _request = (schema, obj, done) => {
  const schemaLib = typeof schema === 'string' && schema === 'http' ? http : https
  const payloadString = typeof obj.data === 'object' ? stringify(obj.data) : false
  if (payloadString && typeof obj.headers === 'object') {
    obj.headers['Content-Length'] = Buffer.byteLength(payloadString)
    const req = schemaLib.request(obj, (res) => {
      const status = res.statusCode
      if (status === 200 || status === 201) {
        done()
      } else {
        done(`Response status: ${status}`)
      }
    })

    req.on('error', (err) => {
      done(err.message)
    })

    req.on('timeout', () => {
      done(t('error.timeout'))
    })

    req.write(payloadString)
    req.end()
  } else {
    done(t('error.required'))
  }
}

export const request = promisify(_request)

export const finalizeRequest = (collection, id, action, obj, final) => {
  if (typeof obj === 'object') {
    db[action](collection, id, obj, async (err, data) => {
      if (!err) {
        final(null, { s: 200, o: { status: 'ok' } })
      } else {
        final(null, { s: 500, e: t('error.internal') })
      }
    })
  } else {
    db[action](collection, id, async (err, data) => {
      if (!err) {
        final(null, { s: 200, o: { status: 'ok' } })
      } else {
        final(null, { s: 500, e: t('error.internal') })
      }
    })
  }
}

const _validEmail = async (email, done) => {
  if (typeof email !== 'undefined' && email !== '' && isEmail(email)) {
    const r = await legit(email).catch(() => done(null, false))
    if (r && r.isValid) {
      done(null, normalizeEmail(email))
    } else {
      done(null, false)
    }
  } else {
    done(null, false)
  }
}

export const validEmail = promisify(_validEmail)

export const validateMsg = (msg) => typeof msg === 'string' && msg.trim().length > 0 ? msg.trim() : false

export const validPhone = (phone) => {
  if (typeof phone !== 'undefined' && phone !== '') {
    return isMobilePhone(phone, { strictMode: true })
  } else {
    return false
  }
}

export const validDate = (dt) => isISO8601(dt, { strict: true })

export const validUrl = (url) => isUrl(url)
