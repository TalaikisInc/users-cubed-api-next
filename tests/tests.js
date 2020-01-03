import { resolve } from 'path'
import { stringify } from 'querystring'
import { createHash, randomBytes } from 'crypto'
import AWSMock from 'mock-aws-s3'
import { describe, it, before, after, afterEach } from 'mocha'
import faker from 'faker'
import request from 'supertest'
import Jm from 'js-meter'
import { red } from 'chalk'
import sinon from 'sinon'
import { assert } from 'chai'

import { USERS_BUCKET_NAME, API_KEY } from '../app/config'
import { encode, decode, encodeRequest } from '../app/lib/proto'
import { handlers, handlerSchema } from '../app/handlers'
import { dialCodeSchema, countriesSchema, dialCodes, countries } from '../app/lib/schemas'
import { en, langSchema } from '../app/lib/translations/locales/en'
import { setLocale, t } from '../app/lib/translations'
import { validEmail, _request, sendErr, sendOk, finalizeRequest, response } from '../app/lib/utils'
import { randomID, tokenHeader, hash, md5, uuidv4, xss, encrypt, decrypt } from '../app/lib/security'
import db, { joinedTableDelete } from '../app/lib/db'
import { _mailgun } from '../app/lib/email/mailgun'
import { _twilio } from '../app/lib/phone/twilio'
require('dotenv').config({ path: resolve(__dirname, '../.env.development') })
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-asserttype-extra'))
  .use(require('chai-as-promised'))
  .use(require('chai-json-schema'))
  .use(require('chai-uuid'))
  .use(require('sinon-chai'))
  .should()
AWSMock.config.basePath = resolve(__dirname, 'buckets')
const s3 = AWSMock.S3({ params: { Bucket: USERS_BUCKET_NAME } })
const server = request('http://localhost:4000')

describe('handler', () => {
  const id1 = faker.internet.email()

  before((done) => {
    const params = { Bucket: USERS_BUCKET_NAME }
    s3.createBucket(params, (err) => {
      if (err) {
        console.error(err)
      } else {
        done()
      }
    })
  })

  after((done) => {
    const params = { Bucket: USERS_BUCKET_NAME }
    s3.deleteBucket(params, (err) => {
      if (err) {
        console.error(err)
      } else {
        done()
      }
    })
  })

  /*
  describe('Db', () => {
    it('Db save should work', (done) => {
      const table = 'users'
      const data = { name: 'John', phone: '+000000000' }

      db.create(table, id1, data).catch((e) => done(e))
      done()
    })

    it('Db read should work', (done) => {
      const table = 'users'
      const data = { name: 'John', phone: '+000000000' }

      db.read(table, id1)
        .then((d) => {
          d.should.be.deep.equal(data)
          done()
        })
        .catch((e) => done(e))
    })

    it('Db update should work', (done) => {
      const table = 'users'
      const newData = { name: 'John', phone: '+000000001' }

      db.update(table, id1, newData)
        .then((d) => {
          d.should.be.deep.equal(newData)
          done()
        })
        .catch((e) => done(e))
    })

    it('Db list should work', (done) => {
      const table = 'users'
      const id2 = faker.internet.email()
      const id3 = faker.internet.email()
      const id4 = faker.internet.email()
      const data = { name: 'John', phone: '+000000000' }

      db.create(table, id2, data)
        .then(async () => {
          await db.create(table, id3, data).catch((e) => done(e))
          await db.create(table, id4, data).catch((e) => done(e))
          const ls = await db.listDir(table).catch((e) => done(e))
          ls.length.should.be.equal(4)
          done()
        })
        .catch((e) => done(e))
    })

    it('Db destroy should work', (done) => {
      const table = 'users'

      db.destroy(table, id1)
        .then(async () => {
          const ls = await db.listDir(table).catch((e) => done(e))
          ls.length.should.be.equal(3)
          done()
        })
        .catch((e) => done(e))
    })

    it('Join delete should work', (done) => {
      const table1 = 'purchases'
      const cols = ['1', '2', '3']
      const data = { test: 'test' }
      db.create(table1, cols[0], data)
        .then(() => {
          db.create(table1, cols[1], data)
            .then(() => {
              db.create(table1, cols[2], data)
                .then(() => {
                  joinedTableDelete(table1, cols)
                    .then(async () => {
                      const ls = await db.listDir(table1).catch((e) => done(e))
                      ls.length.should.be.equal(0)
                      done()
                    })
                    .catch((e) => done(e))
                })
                .catch((e) => done(e))
            })
            .catch((e) => done(e))
        })
        .catch((e) => done(e))
    })
  })

  describe('Third APIs', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('Request should work', (done) => {
      const callback = sinon.spy()
      const schemaLib = 'https'
      const obj = {
        data: {
          protocol: 'https:',
          hostname: 'google.com',
          method: 'GET',
          path: '/'
        }
      }
      _request(schemaLib, obj, callback)
      assert(callback.calledOnce)
      done()
    })

    it('Email sending should work', async (done) => {
      const callback = sinon.spy()
      await _mailgun('info@talaikis.com', 'Test subject', 'This is message', callback)
      assert(callback.called)
    })

    it('SMS sending should work', async (done) => {
      const callback = sinon.spy()
      await _twilio('10000000000', 'This is message', callback)
      assert(callback.called)
    })
  })

  describe('Objects', () => {
    it('Test countries object', (done) => {
      countries.should.be.jsonSchema(countriesSchema)
      done()
    })

    it('Test dial codes object', (done) => {
      dialCodes.should.be.jsonSchema(dialCodeSchema)
      done()
    })

    it('Test translations object', (done) => {
      en.should.be.jsonSchema(langSchema)
      done()
    })
  })

  describe('Responses', () => {
    it('Send error should work', (done) => {
      sendErr(400, 'Test Error', (_, res) => {
        res.body.should.be.equal('CgpUZXN0IEVycm9y')
        res.headers['Content-Type'].should.be.equal('application/x-protobuf')
        res.statusCode.should.be.equal(400)
        res.isBase64Encoded.should.be.equal(true)
        done()
      })
    })

    it('Send ok status should work', (done) => {
      sendOk((_, res) => {
        res.body.should.be.equal('CgJPaw==')
        res.headers['Content-Type'].should.be.equal('application/x-protobuf')
        res.statusCode.should.be.equal(200)
        res.isBase64Encoded.should.be.equal(true)
        done()
      })
    })

    it('Response finalization should work', (done) => {
      finalizeRequest('users', 'test@test.com', 'create', { data: 'data' }, (_, res) => {
        res.body.should.be.equal('CgJPaw==')
        res.headers['Content-Type'].should.be.equal('application/x-protobuf')
        res.statusCode.should.be.equal(200)
        res.isBase64Encoded.should.be.equal(true)
        done()
      })
    })
  })

  describe('Functions', () => {
    it('Test handlers object', (done) => {
      handlers.should.be.jsonSchema(handlerSchema)
      done()
    })

    it('Token header checker should not crash with empty body', (done) => {
      const payload = {}
      tokenHeader(payload)
        .then(() => {
          done()
        })
        .catch(() => done())
    })

    it('Hashing should work', (done) => {
      const payload = 'test'
      hash(payload)
        .then((h) => {
          h.should.be.string()
          done()
        })
        .catch((e) => done(e))
    })

    it('XSS should work', (done) => {
      const payload = { body: '<a><a><a>' }
      xss(payload)
        .then((cleaned) => {
          cleaned.body.should.be.equal('&lt;a>&lt;a>&lt;a>')
          done()
        })
        .catch((e) => done(e))
    })

    it('MD5 should work', (done) => {
      const data = 'test string 123456789 ###@~'
      const m = md5(data)
      m.should.be.equal('c20e23fd5e8994922eea49239a9a2131')
      done()
    })

    it('Uuidv4 should work correctly', (done) => {
      const uid = uuidv4()
      uid.should.be.a.uuid('v4')
      done()
    })
  })

  it('Encryption should work', (done) => {
    const iv = randomBytes(16).toString('hex')
    const data = 'lorem ipsum'
    const key = randomBytes(32).toString('hex')
    encrypt(data, key, iv)
      .then((encrypted) => {
        encrypted.should.be.string()
        done()
      })
      .catch((e) => done(e))
  })

  it('Decryption should work', (done) => {
    const iv = randomBytes(16).toString('hex')
    const data = 'lorem ipsum'
    const key = randomBytes(32).toString('hex')
    encrypt(data, key, iv)
      .then(async (encrypted) => {
        const decrypted = await decrypt(encrypted, key, iv).catch((e) => done(e))
        decrypted.should.be.equal(data)
        done()
      })
      .catch((e) => done(e))
  })

  it('Test translation system', async () => {
    await setLocale({ payload: { locale: 'fr' } })
    const fr = `${t('error.unauthorized')}`
    fr.should.be.equal('Non autorisé.')
  })

  it('Test email validation system', async () => {
    const v1 = await validEmail('info@talaikis.com')
    const v2 = await validEmail('infotalaikis.com')
    const v3 = await validEmail('info@zdgfgzfd.com')
    v1.should.be.equal('info@talaikis.com')
    v2.should.be.equal(false)
    v3.should.be.equal(false)
  })

  it('Should generate random IDs', (done) => {
    randomID(50)
      .then((n) => {
        n.should.be.string()
        n.length.should.be.equal(100)
        done()
      })
      .catch((e) => done(e))
  })

  it('Should pass collisions test', (done) => {
    const b = []
    randomID(12)
      .then(async (n) => {
        for (let i = 0; i < 100000; i++) {
          const n1 = await randomID(12)
          b.push(n1)
          n.should.not.equal(n1)
          if (b.length === 100000) {
            done()
          }
        }
      })
      .catch((e) => done(e))
  })

  it('Should encode and decode protobuffers', (done) => {
    const action = 'USER_CREATE'
    const email = faker.internet.email()
    const password = faker.internet.password()
    const testPath = 'decoderTest'
    const messageType = 'DecoderTest'
    const output = {
      action,
      email,
      password,
      tosAgreement: true
    }
    encode(testPath, output, messageType)
      .then((buffer) => {
        const str = buffer.toString('base64')
        str.should.be.string()
        decode(testPath, str, messageType)
          .then((obj) => {
            obj.should.be.deep.equal(output)
            done()
          })
          .catch((e) => done(e))
      })
      .catch((e) => done(e))
  })

  it('Encoder should not break on wrong data', (done) => {
    const testPath = 'decoderTest'
    const messageType = 'DecoderTest'
    const output = {
      action: 10,
      email: true,
      password: true,
      tosAgreement: 'test'
    }
    encode(testPath, output, messageType)
      .then((buffer) => {
        const str = buffer.toString('base64')
        str.should.be.string()
        done()
      })
      .catch(() => done())
  })

  it('Decoder should not break on wrong data', (done) => {
    const testPath = 'decoderTest'
    const messageType = 'DecoderTest'
    const output = {
      action: 10,
      email: true,
      password: true,
      tosAgreement: 'test'
    }
    encode(testPath, output, messageType)
      .then((buffer) => {
        const str = buffer.toString('base64')
        ;(typeof str).should.be.equal('string')
        decode(testPath, str, messageType)
          .then((obj) => {
            obj.should.be.deep.equal(output)
            done()
          })
          .catch(() => done())
      })
      .catch(() => done())
  })
  */

  describe('User', () => {
    /*
    it('Should create user', async () => {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const filePath = handlers['USER_CREATE'].file
      const messageType = handlers['USER_CREATE'].class
      const output = {
        email,
        password,
        tosAgreement: true,
        locale: 'en'
      }
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => console.log(e))
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'USER_CREATE',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      }

      await response(event, (_, res) => {
        res.body.should.equal('CgJvaw==')
        res.headers.Action.should.equal('UserCreate')
        res.headers['Content-Type'].should.be.equal('application/x-protobuf')
        res.statusCode.should.be.equal(200)
        res.isBase64Encoded.should.be.equal(true)
      })
    })

    it('Handler lifecycle should return errors', async () => {
      const filePath = handlers['USER_CREATE'].file
      const messageType = handlers['USER_CREATE'].class
      const output = {
        email: 'a',
        password: 'a',
        tosAgreement: true,
        locale: 'en'
      }
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => console.log(e))
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'USER_CREATE',
          Accept: 'application/x-protobuf',
          'X-API-Key': API_KEY
        }
      }

      await response(event, (_, res) => {
        res.body.should.equal('ChhNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcy4=')
        res.headers.Action.should.equal('Error')
        res.headers['Content-Type'].should.be.equal('application/x-protobuf')
        res.statusCode.should.be.equal(400)
        res.isBase64Encoded.should.be.equal(true)
      })
    })

    it('Should not allow calls w/o API key', async () => {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const filePath = handlers['USER_CREATE'].file
      const messageType = handlers['USER_CREATE'].class
      const output = {
        email,
        password,
        tosAgreement: true,
        locale: 'en'
      }
      const buffer = await encodeRequest(filePath, output, messageType).catch((e) => console.log(e))
      const event = {
        body: buffer.toString('base64'),
        headers: {
          Action: 'USER_CREATE',
          Accept: 'application/x-protobuf',
          'X-API-Key': 'wrong'
        }
      }

      await response(event, (_, res) => {
        res.body.should.equal('Cg1VbmF1dGhvcml6ZWQu')
        res.headers.Action.should.equal('Error')
        res.headers['Content-Type'].should.be.equal('application/x-protobuf')
        res.statusCode.should.be.equal(403)
        res.isBase64Encoded.should.be.equal(true)
      })
    })
    */

    it('Should get account', async () => {
    })

    it('Should delete user', async () => {
    })

    it('Benchmark user get', () => {
      const m = new Jm({ isPrint: true, isKb: true })
      const meter = m.stop()
      console.log(meter)
    })

    it('Should confirm account', async () => {
    })

    it('Should edit user', async () => {
      const firstName = faker.name.firstName()
      const lastName = faker.name.lastName()
    })

    it('Should signin with Social', async () => {
    })

    it('Should reset password', async () => {
    })
  })

  /*
  describe('Token', () => {
    it('Should signin', async () => {
    })

    it('Should signout', async () => {
    })

    it('Should extend token', async () => {
    })
  })

  describe('Referrals', () => {
  })

  describe('Contact us', () => {
  })

  describe('Upload', () => {
  })

  describe('Blog', () => {
  })

  describe('Shop', () => {
  })
  */
})

/*
+ { action: 'USER_DESTROY' }
+ { action: 'USER_CREATE_SOCIAL', provider, idToken, accessToken }
+ { action: 'USER_EDIT', ...rest }
+ { action: 'USER_GET' }

+ { action: 'TOKEN_DESTROY', tokenId }
+ { action: 'TOKEN_EXTEND', tokenId }

+ { action: 'CONFIRM', token }
+ { action: 'RESET_CREATE', email }

+ { action: 'TOKEN_CREATE', email, password }

+ { action: 'REFER_REFER', to }
{ action: 'REFER_USE', to }
{ action: 'REFER_REGISTER', to }

+ { action: 'CONTACT_US', ... }
+ { action: 'UPLOAD', ... }
*/
