import { promisify } from 'util'
import AWS from 'aws-sdk'

AWS.config.apiVersions = {
  s3: '2006-03-01',
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  region: process.env.REGION
}
const s3 = new AWS.S3()
const { user } = require('./schemas')

const _createBucket = (done) => {
  const params = {
    Bucket: process.env.BUCKET,
    ACL: 'private'
  }
  s3.createBucket(params, (err, data) => {
    if (err) {
      done(err.message)
    }
    done(null, data)
  })
}

const createBucket = promisify(_createBucket)

const _save = (id, data, done) => {
  const s = typeof data === 'object' ? JSON.stringify(data) : data
  const params = {
    Body: Buffer.from(s),
    Bucket: process.env.USERS_BUCKET_NAME,
    Key: id
  }

  s3.putObject(params, (err, data) => {
    if (err) {
      done(err.message)
    } else {
      done(null, JSON.parse(params.Body.toString('utf8')))
    }
  })
}

const save = promisify(_save)

const _setEncryption = (done) => {
  const params = {
    Bucket: process.env.BUCKET,
    ServerSideEncryptionConfiguration: {
      Rules: [
        {
          ApplyServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256'
          }
        }
      ]
    }
  }

  s3.putBucketEncryption(params, (err, data) => {
    if (err) {
      done(err.message)
    } else {
      done(null, data)
    }
  })
}

const setEncryption = promisify(_setEncryption)

const init = async () => {
  console.log('Creating bucket...')
  const res = await createBucket().catch((e) => console.log(e.message))
  console.log(res)
  console.log('Setting encryption...')
  await setEncryption()
  console.log('Creating schema...')
  await save('schemas/user', user).catch((e) => console.log(e.message))
}

init()
