import { resolve } from 'path'
import protobuf from 'protobufjs'
import { promisify } from 'util'
import { red } from 'chalk'

import { sendError } from '../utils'
const definitionsDirectory = resolve(__dirname, '../schemas/')

const _decode = async (filePath, base64Buffer, messageType, done) => {
  const p = resolve(definitionsDirectory, 'requests', `${filePath}.proto`)
  protobuf.load(p, (err, root) => {
    if (!err && root) {
      try {
        const MsgType = root.lookupType(messageType)
        const message = MsgType.decode(Buffer.from(base64Buffer, 'base64'))
        const obj = MsgType.toObject(message)
        done(null, obj)
      } catch (err) {
        done(err)
      }
    } else if (err) {
      console.log(red(err))
      done(err)
    }
  })
}

export const decode = promisify(_decode)

const _encode = (filePath, output, messageType, done) => {
  const p = resolve(definitionsDirectory, 'responses', `${filePath}.proto`)
  protobuf.load(p, (err, root) => {
    if (err) done(err)
    try {
      const MsgType = root.lookupType(messageType)
      const message = MsgType.create(output)
      done(null, MsgType.encode(message).finish())
    } catch (err) {
      done(err)
    }
  })
}

export const encode = promisify(_encode)

export const protoResponse = async (statusCode, output, filePath, messageType, final) => {
  const buffer = await encode(filePath, output, messageType).catch(async () => await sendError(400, t('error.bad_request'), final))
  const response = {
    statusCode,
    headers: {
      'Content-Type': 'application/x-protobuf',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true
  }
  final(null, response)
}
