const { resolve } = require('path')
require('@babel/polyfill')
require('@babel/register')({ presets: ['@babel/preset-env'] })
require('dotenv').config({ path: resolve(__dirname, '../.env.development') })
const AWSMock = require('mock-aws-s3')
const { describe, it, before, after } = require('mocha')
const faker = require('faker')
const request = require('supertest')
const Jm = require('js-meter')
require('chai').use(require('chai-as-promised')).should()

const { USERS_BUCKET_NAME, API_KEY } = require('../app/config')
const { encode, decode } = require('../app/lib/proto')
const handlers = require('../app/handlers')

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
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const email = faker.internet.email()
    const password = faker.internet.password()

    const filePath = `requests/${handlers.USER_CREATE.file}`
    const messageType = handlers.USER_CREATE.class
    const output = {
      action: 'USER_CREATE',
      email,
      password,
      firstName,
      lastName,
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
        if (error) {
          const meter = m.stop()
          console.log(meter)
          return done(error)
        }
        const meter = m.stop()
        // "Error: Serverless-offline: handler for 'handler' is not a function",
        result.body.should.equal(
          // decode proto response and check
        )
        return done()
      })
  }).timeout(60000)
})

/*
{ action: 'USER_DESTROY' }
{ action: 'TOKEN_CREATE', email: email, password: password }
{ action: 'CONFIRM', token: token }
{ action: 'RESET_CREATE', email: email }
{ action: 'CONFIRM', token: token }
{ action: 'USER_CREATE_SOCIAL', provider }
{ action: 'USER_EDIT', ...rest }
{ action: 'USER_GET' }
{ action: 'REFER_REFER', to }
{ action: 'TOKEN_DESTROY', tokenId: token }
*/
