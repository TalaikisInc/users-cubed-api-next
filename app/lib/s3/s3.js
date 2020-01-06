import AWS from 'aws-sdk'
import { promisify } from 'util'

import { USERS_BUCKET_NAME, ENCRYPTION_PASSWORD, S3_ACCESS_KEY, S3_ACCESS_SECRET, S3_REGION } from '../../config'
import { md5 } from '../security'
AWS.config.apiVersions = {
  s3: '2006-03-01',
  accessKeyId: S3_ACCESS_KEY,
  secretAccessKey: S3_ACCESS_SECRET,
  region: S3_REGION
}
const s3 = new AWS.S3()
const s3db = {}

const _getData = (id, done) => {
  const params = {
    Bucket: USERS_BUCKET_NAME,
    Key: id
  }

  s3.getObject(params, (err, data) => {
    if (err) {
      done(err.message)
    } else {
      const o = JSON.parse(data.Body.toString('utf8'))
      done(null, o)
    }
  })
}

const getData = promisify(_getData)

const _put = (params, done) => {
  s3.putObject(params, (err, data) => {
    if (err) {
      done(err.message)
    } else {
      done(null, JSON.parse(params.Body.toString()))
    }
  })
}

const _saveUser = async (id, data, role, done) => {
  const s = typeof data === 'object' ? JSON.stringify(data) : data
  const params = {
    Body: Buffer.from(s),
    Bucket: USERS_BUCKET_NAME,
    Key: id,
    ServerSideEncryption: 'AES256',
    ContentMD5: md5(s),
    SSECustomerKey: Buffer.from(ENCRYPTION_PASSWORD),
    SSECustomerKeyMD5: md5(ENCRYPTION_PASSWORD),
    Tagging: `role=${role}`
  }
  _put(params, done)
}

const saveUser = promisify(_saveUser)

const _save = async (id, data, done) => {
  const s = typeof data === 'object' ? JSON.stringify(data) : data
  const params = {
    Body: Buffer.from(s),
    Bucket: USERS_BUCKET_NAME,
    ServerSideEncryption: 'AES256',
    ContentMD5: md5(s),
    SSECustomerKey: Buffer.from(ENCRYPTION_PASSWORD),
    SSECustomerKeyMD5: md5(ENCRYPTION_PASSWORD),
    Key: id
  }
  _put(params, done)
}

const save = promisify(_save)

const _remove = (id, done) => {
  const params = {
    Bucket: USERS_BUCKET_NAME,
    Key: id
  }

  s3.deleteObject(params, (err, data) => {
    if (err) {
      done(err.message)
    } else {
      done(null, data)
    }
  })
}

const remove = promisify(_remove)

const _multiRemove = (objs, done) => {
  const params = {
    Bucket: USERS_BUCKET_NAME,
    Delete: {
      Objects: objs,
      Quiet: false
    }
  }

  s3.deleteObjects(params, (err, data) => {
    if (err) {
      done(err.message)
    } else {
      done(null, data)
    }
  })
}

const multiRemove = promisify(_multiRemove)

const _list = (dir, done) => {
  const params = {
    Bucket: USERS_BUCKET_NAME,
    MaxKeys: 10,
    Prefix: dir
  }

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      done(err.message)
    } else {
      done(null, data.Contents)
    }
  })
}

const listItems = promisify(_list)

const _setEncryption = (done) => {
  const params = {
    Bucket: USERS_BUCKET_NAME,
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

const _upload = (name, key, stream, done) => {
  const params = { Bucket: name, Key: key, Body: stream }
  s3.upload(params, (err, data) => {
    if (err) {
      done(err.message)
    } else {
      done(null, data)
    }
  })
}

const upload = promisify(_upload)

const _select = (bucket, key, query, done) => {
  // ex.: 'SELECT s.* FROM S3Object[*][*] s WHERE s.price < 9 LIMIT 10'
  const params = {
    Bucket: bucket,
    Key: key,
    ExpressionType: 'SQL',
    Expression: query,
    InputSerialization: {
      CompressionType: 'GZIP',
      JSON: {
        Type: 'DOCUMENT'
      }
    },
    OutputSerialization: {
      JSON: {
        RecordDelimiter: ','
      }
    }
  }
  s3.selectObjectContent(params)
    .promise()
    .then((output) => {
      output.Payload.on('data', (event) => {
        if (event.Records) {
          const buffer = event.Records.Payload
          done(null, buffer.toString())
        }
      })
    })
    .then((err) => {
      done(err)
    })
}

const select = promisify(_select)

s3db.getData = getData
s3db.saveUser = saveUser
s3db.save = save
s3db.remove = remove
s3db.multiRemove = multiRemove
s3db.listItems = listItems
s3db.setEncryption = setEncryption
s3db.upload = upload
s3db.select = select

export default s3db
