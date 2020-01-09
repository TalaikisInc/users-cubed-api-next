import { resolve } from 'path'
import protobuf from 'protobufjs'
import { promisify } from 'util'

import { ALLOW_ORIGIN } from '../../config'
import { sendErr } from '../utils'
import { t } from '../translations'
const definitionsDirectory = resolve(__dirname, '../schemas')
const resBundle = resolve(definitionsDirectory, 'resBundle.json')
const reqBundle = resolve(definitionsDirectory, 'reqBundle.json')

const decoder = (p, base64Buffer, messageType, done) => {
  protobuf.load(p, (err, root) => {
    if (!err && root) {
      try {
        const MsgType = root.lookupType(messageType)
        const message = MsgType.decode(Buffer.from(base64Buffer, 'base64'))
        const obj = MsgType.toObject(message)
        done(null, obj)
      } catch (e) {
        done(e.message)
      }
    } else if (err) {
      done(err.message)
    }
  })
}

const _decode = async (base64Buffer, messageType, done) => {
  decoder(reqBundle, base64Buffer, messageType, done)
}

export const decode = promisify(_decode)

const encoder = (p, output, messageType, done) => {
  protobuf.load(p, (err, root) => {
    if (!err && root) {
      try {
        const MsgType = root.lookupType(messageType)
        const message = MsgType.create(output)
        const enc = MsgType.encode(message).finish()
        done(null, enc)
      } catch (e) {
        done(e.message)
      }
    } else {
      done(err.message)
    }
  })
}

const _encode = (output, messageType, done) => {
  encoder(resBundle, output, messageType, done)
}

export const encode = promisify(_encode)

// @TODO remove messageType
const _encodeRequest = async (output, messageType, done) => {
  _encodeBody(output, done)
}

export const encodeRequest = promisify(_encodeRequest)

const _decodeResponse = (base64Buffer, messageType, done) => {
  decoder(resBundle, base64Buffer, messageType, done)
}

export const decodeResponse = promisify(_decodeResponse)

const _encodeBody = (base64Buffer, done) => {
  encoder(resBundle, base64Buffer, 'Body', done)
}

export const encodeBody = promisify(_encodeBody)

const _decodeBody = (base64Buffer, done) => {
  decoder(reqBundle, base64Buffer, 'Body', done)
}

export const decodeBody = promisify(_decodeBody)

const _protoResponse = async (statusCode, output, messageType, done) => {
  const buffer = await encode(output, messageType).catch(async (e) => done(null, await sendErr(500, e)))
  if (buffer) {
    const body = buffer.toString('base64')
    done(null, {
      statusCode,
      headers: {
        'Content-Type': 'application/x-protobuf',
        Accept: 'application/x-protobuf',
        'Access-Control-Allow-Origin': ALLOW_ORIGIN,
        Action: messageType
      },
      body,
      isBase64Encoded: true
    })
  } else {
    done(null, await sendErr(500, t('error.unknown')))
  }
}

export const protoResponse = promisify(_protoResponse)
