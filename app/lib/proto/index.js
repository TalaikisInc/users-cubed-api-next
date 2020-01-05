import { resolve } from 'path'
import protobuf from 'protobufjs'
import { promisify } from 'util'

import { ALLOW_ORIGIN } from '../../config'
import { sendErr } from '../utils'
const definitionsDirectory = resolve(__dirname, '../schemas/')

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

const _decode = async (filePath, base64Buffer, messageType, done) => {
  const p = resolve(definitionsDirectory, 'requests', `${filePath}.proto`)
  decoder(p, base64Buffer, messageType, done)
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

const _encode = (filePath, output, messageType, done) => {
  const p = resolve(definitionsDirectory, 'responses', `${filePath}.proto`)
  encoder(p, output, messageType, done)
}

export const encode = promisify(_encode)

const _encodeRequest = (filePath, output, messageType, done) => {
  const p = resolve(definitionsDirectory, 'requests', `${filePath}.proto`)
  encoder(p, output, messageType, done)
}

export const encodeRequest = promisify(_encodeRequest)

const _decodeResponse = (filePath, base64Buffer, messageType, done) => {
  const p = resolve(definitionsDirectory, 'responses', `${filePath}.proto`)
  decoder(p, base64Buffer, messageType, done)
}

export const decodeResponse = promisify(_decodeResponse)

const _protoResponse = async (statusCode, output, filePath, messageType, done) => {
  const buffer = await encode(filePath, output, messageType).catch(async (e) => done(await sendErr(500, e)))
  done(null, {
    statusCode,
    headers: {
      'Content-Type': 'application/x-protobuf',
      'Access-Control-Allow-Origin': ALLOW_ORIGIN,
      'Access-Control-Allow-Credentials': true,
      Action: messageType
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true
  })
}

export const protoResponse = promisify(_protoResponse)
