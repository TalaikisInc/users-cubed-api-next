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

export const protoResponse = async (statusCode, result, filePath, messageType, callback) => {
  const root = await loadAsync(`${definitionsDirectory}${filePath}`)
  const MsgType = root.lookupType(messageType)
  const message = MsgType.create(result)
  const buffer = MsgType.encode(message).finish()

  const response = {
    statusCode,
    headers: { 'Content-Type': 'application/x-protobuf' },
    body: buffer.toString('base64'),
    isBase64Encoded: true
  }
  callback(null, response)
}
