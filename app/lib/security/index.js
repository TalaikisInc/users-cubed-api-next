import { inHTMLData } from 'xss-filters'
import { promisify } from 'util'
import { createHash, createHmac, createCipheriv, createDecipheriv, randomBytes } from 'crypto'

import db from '../db'
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

const _encrypt = (data, key, iv, done) => {
  try {
    const cipher = createCipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    done(null, encrypted)
  } catch (e) {
    done(e)
  }
}

const _decrypt = (encrypted, key, iv, done) => {
  try {
    const decipher = createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    done(null, decrypted)
  } catch (e) {
    done(e)
  }
}

export const md5 = (data) => {
  return createHash('md5').update(data).digest('hex')
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
    done(null, createHmac('sha256', HASH_SECRET).update(msg).digest('hex'))
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
      done(null, buf.toString('hex'))
    }
  })
}

export const randomID = promisify(_randomID)

const _tokenHeader = (data, done) => {
  if (data.headers && typeof data.headers.Authorization === 'string') {
    let token = data.headers.Authorization.replace('Bearer ', '')
    token = token.length === 64 ? token : false
    done(null, token)
  } else {
    done(t('error.unauthorized'))
  }
}

export const tokenHeader = promisify(_tokenHeader)

const _auth = async (data, done) => {
  const token = await tokenHeader(data).catch((e) => done(e))
  if (token) {
    const tokenData = await db.read('tokens', token).catch(() => t('token.expired'))
    if (tokenData && tokenData.expiry > Date.now()) {
      done(null, tokenData)
    }
  }
  done(t('error.unauthorized'))
}

export const auth = promisify(_auth)
