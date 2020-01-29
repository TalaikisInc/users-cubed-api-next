import { promisify } from 'util'

import { encoder, decoder } from './protoFunctions'
import { ALLOW_ORIGIN } from '../../config'
import { t } from '../translations'
import { apiAuth } from '../auth'
import { handlers } from '../../handlers'
import { Body } from '../schemas/requests/body'
import { Error as Err } from '../schemas/responses/error'
import { Ok } from '../schemas/responses/ok'

const _encode = (handler, output, done) => {
  encoder(handler, output, done)
}

const _decode = (handler, output, done) => {
  encoder(handler, output, done)
}

export const encode = promisify(_encode)
export const decode = promisify(_decode)

const _encodeRequest = (output, done) => {
  encoder(Body, output, done)
}

const _decodeResponse = (handler, base64Buffer, done) => {
  decoder(handler, base64Buffer, done)
}

export const encodeRequest = promisify(_encodeRequest)
export const decodeResponse = promisify(_decodeResponse)

const _encodeBody = (output, done) => {
  encoder(Body, output, done)
}

const _decodeBody = (base64Buffer, done) => {
  decoder(Body, base64Buffer, done)
}

export const encodeBody = promisify(_encodeBody)
export const decodeBody = promisify(_decodeBody)

export const protoResponse = async (statusCode, output, handler, done) => {
  const messageType = handler.class
  const body = await encode(handler.rf, output).catch(async (e) => await sendErr(500, e))
  const res = {
    statusCode,
    headers: {
      'Content-Type': 'text/plain',
      Accept: 'text/plain',
      'Access-Control-Allow-Origin': ALLOW_ORIGIN,
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      Action: messageType
    },
    body,
    isBase64Encoded: false
  }
  return res
}

/**
  * @desc Wrapper for ptotobuf error response
  * @param number status - Response status
  * @param string msg - Error
  * @return string - Base64 encoded buffer
*/
export const sendErr = async (status, msg) => {
  const handler = { rf: Err, class: 'Error' }
  return await protoResponse(status, { error: msg }, handler)
}

export const sendOk = async () => {
  const handler = { rf: Ok, class: 'Ok' }
  return await protoResponse(200, { status: 'ok' }, handler)
}

const _decodeRequest = async (base64Buffer, done) => {
  const decodedEvent = await decodeBody(base64Buffer).catch((e) => done(e))
  const authorized = await apiAuth(decodedEvent).catch((e) => done(e))
  if (authorized) {
    done(null, {
      body: authorized.body,
      headers: authorized.headers
    })
  } else {
    done(t('error.unauthorized'))
  }
}

export const _responseConstructor = async (event, done) => {
  try {
    const body = JSON.parse(event.body)
    const valid = typeof body === 'object' && typeof body.body === 'string'
    if (valid) {
      const payload = await decodeRequest(body.body).catch(async (e) => done(null, await sendErr(500, e)))
      if (payload) {
        const action = payload.headers.Action
        const handler = typeof handlers[action] !== 'undefined' ? handlers[action] : handlers.NOT_FOUND
        if (typeof handler === 'object') {
          await handler.h(payload, async (_, res) => {
            if (res && res.s && res.o) {
              const out = await protoResponse(res.s, res.o, handler)
              done(null, out)
            } else if (res && res.s && res.e) {
              const e = await sendErr(res.s, res.e)
              done(null, e)
            }
          })
        } else {
          const e = await sendErr(500, t('error.not_found'))
          done(null, e)
        }
      } else {
        const e = await sendErr(403, t('error.unauthorized'))
        done(null, e)
      }
    } else {
      const e = await sendErr(403, t('error.unauthorized'))
      done(null, e)
    }
  } catch (e) {
    const err = await sendErr(403, e.message)
    done(null, err)
  }
}

export const decodeRequest = promisify(_decodeRequest)
export const responseConstructor = promisify(_responseConstructor)
