import { resolve } from 'path'
import AWSMock from 'mock-aws-s3'
import { describe, it, before, after } from 'mocha'
import faker from 'faker'
import request from 'supertest'
import Jm from 'js-meter'
import { red } from 'chalk'

import { USERS_BUCKET_NAME, API_KEY } from '../app/config'
import { encode, decode } from '../app/lib/proto'
import { handlers, handlerSchema } from '../app/handlers'
import { dialCodeSchema, countriesSchema, dialCodes, countries } from '../app/lib/schemas'
import { en, langSchema } from '../app/lib/translations/locales/en'
import { setLocale, t } from '../app/lib/translations'
import { validEmail } from '../app/lib/utils'
import { randomID, tokenHeader, hash, md5, uuidv4, xss } from '../app/lib/security'
import db from '../app/lib/db'
import { assert } from 'chai'
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-asserttype-extra'))
  .use(require('chai-as-promised'))
  .use(require('chai-json-schema'))
  .use(require('chai-uuid'))
  .should()
AWSMock.config.basePath = resolve(__dirname, 'buckets')
const s3 = AWSMock.S3({ params: { Bucket: USERS_BUCKET_NAME } })
const timeout = 60000

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

  const server = request('http://localhost:4000')

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
  }).timeout(timeout)

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
  }).timeout(timeout)

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
  }).timeout(timeout)

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
  }).timeout(timeout)

  it('Should generate random IDs', (done) => {
    randomID(50)
      .then((n) => {
        n.should.be.string()
        n.length.should.be.equal(100)
        done()
      })
      .catch((e) => done(e))
  }).timeout(timeout)

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
  }).timeout(timeout)

  /*
  it('Should create user', async (done) => {
    const email = faker.internet.email()
    const password = faker.internet.password()

    const filePath = `${handlers['USER_CREATE'].file}`
    const messageType = handlers['USER_CREATE'].class
    const output = {
      action: 'USER_CREATE',
      email,
      password,
      tosAgreement: true
    }
    const buffer = await encode(filePath, output, messageType).catch((e) => console.log(red(e)))
    const m = new Jm({ isPrint: true, isKb: true })
    server.post('/')
      .send(buffer.toString('base64'))
      .set('Accept', 'application/x-protobuf')
      .set('X-API-Key', API_KEY)
      .expect('Content-Type', /x-protobuf/)
      .expect(200)
      .end((error, result) => {
        console.error('result')
        // console.error(result)
        if (error) {
          console.error(error)
          return done(error)
        }
        const meter = m.stop()
        console.log(meter)
        // "Error: Serverless-offline: handler for 'handler' is not a function",
        result.should.equal(
          // decode proto response and check
        )
        return done()
      })
  }).timeout(timeout)
  */
  it('Test countries object', (done) => {
    countries.should.be.jsonSchema(countriesSchema)
    done()
  }).timeout(timeout)

  it('Test dial codes object', (done) => {
    dialCodes.should.be.jsonSchema(dialCodeSchema)
    done()
  }).timeout(timeout)

  it('Test handlers object', (done) => {
    handlers.should.be.jsonSchema(handlerSchema)
    done()
  }).timeout(timeout)

  it('Token header checker should not crash with empty body', (done) => {
    const payload = {}
    tokenHeader(payload)
      .then(() => {
        done()
      })
      .catch(() => done())
    done()
  }).timeout(timeout)

  it('Hashing should work', (done) => {
    const payload = 'test'
    hash(payload)
      .then((h) => {
        h.should.be.string()
        done()
      })
      .catch((e) => done(e))
  }).timeout(timeout)

  it('XSS should work', (done) => {
    const payload = { body: '<a><a><a>' }
    xss(payload)
      .then((cleaned) => {
        cleaned.should.be.deep.equal({ body: '&lt;a>&lt;a>&lt;a>' })
      })
      .catch((e) => done(e))
  }).timeout(timeout)

  it('MD5 should work', (done) => {
    const data = 'test string 123456789 ###@~'
    const m = md5(data)
    m.should.be.equal('c20e23fd5e8994922eea49239a9a2131')
    done()
  }).timeout(timeout)

  it('Uuidv4 should work correctly', (done) => {
    const uid = uuidv4()
    uid.should.be.a.uuid('v4')
    done()
  }).timeout(timeout)

  /*
  it('Test translations object', async (done) => {
    en.should.be.jsonSchema(langSchema)
    done()
  }).timeout(timeout)
  */

  it('Test translation system', async () => {
    await setLocale({ payload: { locale: 'fr' } })
    const fr = `${t('error.unauthorized')}`
    fr.should.be.equal('Non autorisé.')
  }).timeout(timeout)

  it('Test email validation system', async () => {
    const v1 = await validEmail('info@talaikis.com')
    const v2 = await validEmail('infotalaikis.com')
    const v3 = await validEmail('info@zdgfgzfd.com')
    v1.should.be.equal('info@talaikis.com')
    v2.should.be.equal(false)
    v3.should.be.equal(false)
  }).timeout(timeout)

  it('Should confirm account', async () => {
  })

  it('Should signin', async () => {
  })

  it('Should edit user', async () => {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
  })

  it('Should get account', async () => {
  })

  it('Should delete user', async () => {
  })

  it('Should signout', async () => {
  })

  it('Should extend token', async () => {
  })

  it('Should signin with Social', async () => {
  })

  it('Should reset password', async () => {
  })
})

/*
+ { action: 'USER_DESTROY' }
+ { action: 'TOKEN_CREATE', email, password }
+ { action: 'CONFIRM', token }
+ { action: 'RESET_CREATE', email }
+ { action: 'USER_CREATE_SOCIAL', provider, idToken, accessToken }
+ { action: 'USER_EDIT', ...rest }
+ { action: 'USER_GET' }
+ { action: 'REFER_REFER', to }
{ action: 'REFER_USE', to }
{ action: 'REFER_REGISTER', to }
+ { action: 'TOKEN_DESTROY', tokenId }
+ { action: 'TOKEN_EXTEND', tokenId }
*/
