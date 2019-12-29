import { loadAsync } from 'protobufjs'
import { promisify } from 'util'

const definitionsDirectory = '../definitions/'

const _decode = async (buffer, filePath, messageType, done) => {
  try {
    const root = await loadAsync(`${definitionsDirectory}${filePath}`)
    const MsgType = root.lookupType(messageType)
    const buff = MsgType.decode(buffer)
    done(null, buff)
  } catch (err) {
    done(err.message)
  }
}

export const decode = promisify(_decode)

export const encode = async (filePath, output, messageType) => {
  const root = await loadAsync(`${definitionsDirectory}${filePath}`)
  const MsgType = root.lookupType(messageType)
  const message = MsgType.create(output)
  return MsgType.encode(message).finish()
}

export const protoResponse = async (statusCode, output, filePath, messageType, callback) => {
  const buffer = await encode(filePath, output, messageType)
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
  callback(null, response)
}
