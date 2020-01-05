const { join } = require('path')
const AWS = require('aws-sdk')
require('dotenv').config({ path: join(__dirname, '../.env') })

AWS.config.apiVersions = {
  s3: '2006-03-01',
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  region: process.env.S3_REGION
}
const s3 = new AWS.S3()
const { user } = require('./schema')

const createBucket = (done) => {
  const params = {
    Bucket: process.env.USERS_BUCKET_NAME,
    ACL: 'private'
  }
  s3.createBucket(params, (err, data) => {
    if (err) {
      done(err.message)
    }
    done(null, data)
  })
}

const save = (id, data, done) => {
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

createBucket((err, data) => {
  if (data && !err) {
    console.log(data)
  } else {
    console.error(err)
  }
})

save('schemas/user', user, (err, data) => {
  if (data && !err) {
    console.log(data)
  } else {
    console.error(err)
  }
})
