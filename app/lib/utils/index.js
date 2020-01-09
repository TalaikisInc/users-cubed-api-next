import http from 'http'
import https from 'https'
import { stringify } from 'querystring'
import legit from 'legit'
import { promisify } from 'util'
import { validate } from 'isemail'

import { protoResponse, decode, decodeBody } from '../proto'
import db from '../db'
import { t } from '../translations'
import { apiAuth } from '../auth'
import { handlers } from '../../handlers'

export const sendErr = async (status, msg) => {
  return await protoResponse(status, { error: msg }, 'Error')
}

export const sendOk = async () => {
  return await protoResponse(200, { status: 'Ok' }, 'Ok')
}

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
  if (validate(email)) {
    const r = await legit(email).catch(() => done(null, false))
    if (r && r.isValid) {
      done(null, email)
    } else {
      done(null, false)
    }
  } else {
    done(null, false)
  }
}

export const validEmail = promisify(_validEmail)

const _decodeRequest = async (event, done) => {
  const decodedEvent = await decodeBody(event).catch((e) => done(e))
  const authorized = await apiAuth(decodedEvent).catch((e) => done(e))
  if (authorized) {
    const obj = {
      body: authorized.body,
      headers: authorized.headers
    }
    done(null, obj)
  } else {
    done(t('error.unauthorized'))
  }
}

export const decodeRequest = promisify(_decodeRequest)

const _response = async (event, done) => {
  const payload = await decodeRequest(event).catch(async (e) => done(null, await sendErr(403, e)))
  if (payload) {
    const action = payload.headers.Action
    const handler = typeof handlers[action] !== 'undefined' ? handlers[action] : handlers.NOT_FOUND
    await handler.h(payload, async (_, res) => {
      if (res && res.s && res.o) {
        done(null, await protoResponse(res.s, res.o, handler.class))
      } else if (res && res.s && res.e) {
        done(null, await sendErr(res.s, res.e))
      }
    })
  } else {
    done(null, await sendErr(403, t('error.unauthorized')))
  }
}

export const response = promisify(_response)
