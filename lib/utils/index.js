import { protoResponse } from './lib/proto'
import http from 'http'
import https from 'https'
import { stringify } from 'querystring'
import legit from 'legit'
import { promisify } from 'util'
import { validate } from 'isemail'

import error from '../debug/error'
import dataLib from '../db/functions'
import { t } from '../translations'

export const sendError = async (status, msg, callback) => {
  const response = await protoResponse(status, msg, 'error.proto', 'cubed.Error')
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
    error(err.message)
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
    dataLib[action](collection, id, obj, (err, data) => {
      if (!err) {
        done(200, { status: t('ok') })
      } else {
        done(500, { error: `Could not ${action} from ${collection}.` })
      }
    })
  } else {
    dataLib[action](collection, id, (err, data) => {
      if (!err) {
        done(200, { status: t('ok') })
      } else {
        done(500, { error: `Could not ${action} from ${collection}.` })
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
