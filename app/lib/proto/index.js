import { resolve } from 'path'
import protobuf from 'protobufjs'
import { promisify } from 'util'

console.log('protobuf-------------------------------')
console.log(protobuf)

import { sendError } from '../utils'
const definitionsDirectory = resolve(__dirname, '../schemas/')

const _decode = async (buffer, filePath, messageType, done) => {
  try {
    const root = await protobuf.load(resolve(definitionsDirectory, 'requests', `${filePath}.json`))
    const MsgType = root.lookupType(messageType)
    const obj = MsgType.decode(buffer)
    done(null, obj)
  } catch (err) {
    console.error(err.message)
    const root = await protobuf.load(resolve(definitionsDirectory, 'responses', 'error.json'))
    const MsgType = root.lookupType('Error')
    const obj = MsgType.decode(buffer)
    done(null, obj)
  }
}

export const decode = promisify(_decode)

export const encode = async (filePath, output, messageType) => {
  const root = await protobuf.load(resolve(definitionsDirectory, 'responses', `${filePath}.json`))
  const MsgType = root.lookupType(messageType)
  const message = MsgType.create(output)
  return MsgType.encode(message).finish()
}

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
