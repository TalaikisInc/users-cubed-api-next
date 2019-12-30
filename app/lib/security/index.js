import { inHTMLData } from 'xss-filters'
import { promisify } from 'util'
import { createHash, createHmac, scrypt, createCipheriv, createDecipheriv, randomBytes } from 'crypto'

import { read } from '../db'
import { HASH_SECRET } from '../../config'
import { t } from '../translations'
const algorithm = 'aes-256-cbc'

const _random = (n, done) => {
  randomBytes(n, (err, buf) => {
    if (err) {
      done(err.message)
    }
    done(null, buf.toString('hex'))
  })
}

export const random = promisify(_random)

const _onUserCreate = async (done) => {
  const salt = await random(16)
  const password = await random(20)
  const id = await random(12)
  scrypt(password, salt, 32, async (key) => {
    await set(id, key)
    done(null, 1)
  })
}

export const onUserCreate = promisify(_onUserCreate)

const _clean = (data, done) => {
  let isObject = false
  if (typeof data === 'object') {
    data = JSON.stringify(data)
    isObject = true
  }

  data = inHTMLData(data).trim()
  if (isObject) {
    data = JSON.parse(data)
  }

  done(null, data)
}

const clean = promisify(_clean)

export const xss = async (event) => {
  if (event.body) {
    event.body = await clean(event.body)
  }
  return event
}

const _encrypt = (data, done) => {
  const iv = Buffer.alloc(16, 0)
  const cipher = createDecipheriv(algorithm, key, iv)
  let encrypted = ''
  cipher.on('readable', () => {
    let chunk
    while ((chunk = cipher.read() !== null)) {
      encrypted += chunk.toString('hex')
    }
  })
  cipher.on('end', () => {
    done(null, encrypted)
  })

  cipher.write(data)
  cipher.end()
}

const _decrypt = (key, encrypted, done) => {
  const iv = Buffer.alloc(16, 0)
  const decipher = createCipheriv(algorithm, key, iv)
  let decrypted = ''
  decipher.on('readable', () => {
    let chunk
    while ((chunk = decipher.read() !== null)) {
      decrypted += chunk.toString('utf8')
    }
  })
  decipher.on('end', () => {
    done(null, decrypted)
  })

  decipher.write(encrypted, 'hex')
  decipher.end()
}

export const md5 = (data) => {
  createHash('md5').update(data).digest('hex')
}

export const encrypt = promisify(_encrypt)

export const decrypt = promisify(_decrypt)

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const _hash = (msg, done) => {
  if (typeof msg === 'string' && msg.length > 0) {
    done(false, createHmac('sha256', HASH_SECRET).update(msg).digest('hex'))
  } else {
    done(t('error.hashing'))
  }
}

export const hash = promisify(_hash)

const _randomID = (n, done) => {
  randomBytes(n, (err, buf) => {
    if (err) {
      done(t('error.bytes'))
    } else {
      done(false, buf.toString('hex'))
    }
  })
}

export const randomID = promisify(_randomID)

const _tokenHeader = (data, done) => {
  if (data.headers && typeof data.headers.authorization === 'string') {
    let token = data.headers.authorization.replace('Bearer ', '')
    token = token.length === 64 ? token : false
    done(false, token)
  } else {
    done(t('error.unauthorized'))
  }
}

const tokenHeader = promisify(_tokenHeader)

const _auth = async (data, done) => {
  const token = await tokenHeader(data).catch((e) => done(e))
  if (token) {
    const tokenData = await read('tokens', token).catch(() => t('token.expired'))
    if (tokenData && tokenData.expiry > Date.now()) {
      done(null, tokenData)
    }
  }
  done(t('error.unauthorized'))
}

export const auth = promisify(_auth)
