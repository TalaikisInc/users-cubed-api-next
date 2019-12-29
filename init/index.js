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

createBucket((err, data) => {
  if (data && !err) {
    console.log(data)
  } else {
    console.error(err)
  }
})
