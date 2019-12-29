import http from 'http'
import https from 'https'
import { stringify } from 'querystring'
import legit from 'legit'
import { promisify } from 'util'
import { validate } from 'isemail'

import { protoResponse } from '../proto'
import dataLib from '../db'
import { t } from '../translations'

const _sendError = async (status, msg, callback) => {
  const response = await protoResponse(status, msg, 'responses/error.proto', 'cubed.Error')
  callback(null, response)
}

export const sendError = promisify(_sendError)

const _sendOk = async (callback) => {
  const response = await protoResponse(200, 'Ok', 'responses/ok.proto', 'cubed.Ok')
  callback(null, response)
}

export const sendOk = promisify(_sendOk)

export const sendUser = async (msg, callback) => {
  const response = await protoResponse(200, msg, 'responses/userEdit.proto', 'cubed.UserUpdated')
  callback(null, response)
}

export const request = (schema, obj, done) => {
  const schemaLib = typeof schema === 'string' && schema === 'http' ? http : https
  const payloadString = stringify(obj.data)
  obj.headers['Content-Length'] = Buffer.byteLength(payloadString)

  const req = schemaLib.request(obj, (res) => {
    const status = res.statusCode
    if (status === 200 || status === 201) {
      done({ error: false })
    } else {
      done({ error: status })
    }
  })

  req.on('error', (err) => {
    // @TODO log here
    done({ error: err.message })
  })

  req.on('timeout', () => {
    // @TODO log here
    done({ error: 'Request timed out.' })
  })

  req.write(payloadString)
  req.end()
}

export const finalizeRequest = (collection, id, action, done, obj) => {
  if (typeof obj === 'object') {
    dataLib[action](collection, id, obj, async (err, data) => {
      if (!err) {
        done(200, { status: t('ok') })
      }
      await sendError(500, t('error.internal'), done)
    })
  } else {
    dataLib[action](collection, id, async (err, data) => {
      if (!err) {
        done(200, { status: t('ok') })
      } else {
        await sendError(500, t('error.internal'), done)
      }
    })
  }
}

const _validEmail = (email, done) => {
  if (validate(email)) {
    legit(email).then((res) => {
      if (!res.isValid) {
        done(false)
      } else {
        done(email)
      }
    })
  }
  done(false)
}

export const validEmail = promisify(_validEmail)
