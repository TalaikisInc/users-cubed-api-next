import http from 'http'
import https from 'https'
import { stringify } from 'querystring'
import legit from 'legit'
import { promisify } from 'util'
import { validate } from 'isemail'

import { protoResponse } from '../proto'
import dataLib from '../db'
import { t } from '../translations'

const _sendError = async (status, msg, final) => {
  const response = await protoResponse(status, msg, 'error', 'Error')
  final(null, response)
}

export const sendError = promisify(_sendError)

const _sendOk = async (final) => {
  const response = await protoResponse(200, 'Ok', 'ok', 'Ok')
  final(null, response)
}

export const sendOk = promisify(_sendOk)

export const sendUser = async (msg, final) => {
  const response = await protoResponse(200, msg, 'userEdit', 'UserEdit')
  final(null, response)
}

const _request = (schema, obj, done) => {
  const schemaLib = typeof schema === 'string' && schema === 'http' ? http : https
  const payloadString = stringify(obj.data)
  obj.headers['Content-Length'] = Buffer.byteLength(payloadString)

  const req = schemaLib.request(obj, (res) => {
    const status = res.statusCode
    if (status === 200 || status === 201) {
      done(null)
    } else {
      done(status)
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
}

export const request = promisify(_request)

export const finalizeRequest = (collection, id, action, done, obj) => {
  if (typeof obj === 'object') {
    dataLib[action](collection, id, obj, async (err, data) => {
      if (!err) {
        await sendOk()
      } else {
        await sendError(500, t('error.internal'), done)
      }
    })
  } else {
    dataLib[action](collection, id, async (err, data) => {
      if (!err) {
        await sendOk()
      } else {
        await sendError(500, t('error.internal'), done)
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
