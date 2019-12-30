const { resolve } = require('path')
require('@babel/polyfill')
require('@babel/register')({ presets: ['@babel/preset-env'] })
require('dotenv').config({ path: resolve(__dirname, '../.env.development') })
const AWSMock = require('mock-aws-s3')
const { describe, it, before, after } = require('mocha')
const faker = require('faker')
const request = require('supertest')
const Jm = require('js-meter')
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-json-schema'))
  .should()

const { USERS_BUCKET_NAME, API_KEY } = require('../app/config')
const { encode, decode } = require('../app/lib/proto')
const { handlers, handlerSchema } = require('../app/handlers')
const { dialCodeSchema, countriesSchema, dialCodes, countries } = require('../app/lib/schemas')
const { en, langSchema } = require('../app/lib/translations/locales/en')
const { setLocale, t } = require('../app/lib/translations')
const { validEmail } = require('../app/lib/utils')
AWSMock.config.basePath = resolve(__dirname, 'buckets')
const s3 = AWSMock.S3({
  params: {
    Bucket: USERS_BUCKET_NAME
  }
})

describe('handler', () => {
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
    const buffer = await encode(filePath, output, messageType)
    const m = new Jm({ isPrint: true, isKb: true })
    server.post('/')
      .send(buffer)
      .set('Accept', 'application/x-protobuf')
      .set('X-API-Key', API_KEY)
      .expect('Content-Type', /x-protobuf/)
      .expect(200)
      .end((error, result) => {
        console.error('result')
        console.error(result.body)
        if (error) {
          console.error(error)
          return done(error)
        }
        const meter = m.stop()
        console.log(meter)
        // "Error: Serverless-offline: handler for 'handler' is not a function",
        result.body.should.equal(
          // decode proto response and check
        )
        return done()
      })
  }).timeout(60000)

  it('Test countries object', async (done) => {
    countries.should.be.jsonSchema(countriesSchema)
    done()
  }).timeout(60000)

  it('Test dial codes object', async (done) => {
    dialCodes.should.be.jsonSchema(dialCodeSchema)
    done()
  }).timeout(60000)

  it('Test handlers object', async (done) => {
    handlers.should.be.jsonSchema(handlerSchema)
    done()
  }).timeout(60000)

  /*
  ?
  it('Test translations object', async (done) => {
    en.should.be.jsonSchema(langSchema)
    done()
  }).timeout(60000)
  */

  it('Test translation system', async () => {
    await setLocale({ payload: { locale: 'fr' } })
    const fr = `${t('error.unauthorized')}`
    fr.should.be.equal('Non autorisé.')
  }).timeout(60000)


  it('Test email validation system', async () => {
    const v1 = await validEmail('info@talaikis.com')
    const v2 = await validEmail('infotalaikis.com')
    const v3 = await validEmail('info@zdgfgzfd.com')
    v1.should.be.equal('info@talaikis.com')
    v2.should.be.equal(false)
    v3.should.be.equal(false)
  }).timeout(60000)

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
*/
