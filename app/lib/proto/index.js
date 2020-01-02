import { resolve } from 'path'
import protobuf from 'protobufjs'
import { promisify } from 'util'

import { t } from '../translations'
import { ALLOW_ORIGIN } from '../../config'
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
      } catch (e) {
        done(e)
      }
    } else if (err) {
      done(err)
    }
  })
}

export const decode = promisify(_decode)

const encoder = (p, output, messageType, done) => {
  protobuf.load(p, (err, root) => {
    if (!err && root) {
      try {
        const MsgType = root.lookupType(messageType)
        const message = MsgType.create(output)
        done(null, MsgType.encode(message).finish())
      } catch (e) {
        done(e)
      }
    } else {
      done(err)
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

export const protoResponse = (statusCode, output, filePath, messageType, final) => {
  encode(filePath, output, messageType)
    .then((buffer) => {
      const response = {
        statusCode,
        headers: {
          'Content-Type': 'application/x-protobuf',
          'Access-Control-Allow-Origin': ALLOW_ORIGIN,
          'Access-Control-Allow-Credentials': true
        },
        body: buffer.toString('base64'),
        isBase64Encoded: true
      }
      final(null, response)
    })
    .catch((e) => {
      console.log('Protoresponse', e)
      final(t('error.bad_request'))
    })
}
