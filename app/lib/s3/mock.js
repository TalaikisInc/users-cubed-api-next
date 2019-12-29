import { promisify } from 'util'
import { resolve } from 'path'
import AWSMock from 'mock-aws-s3'

import { USERS_BUCKET_NAME, ENCRYPTION_PASSWORD } from '../../config'
import { md5 } from '../security'
const s3db = {}

AWSMock.config.basePath = resolve(__dirname, '../../../tests/buckets')
const s3 = AWSMock.S3({
  params: {
    Bucket: USERS_BUCKET_NAME
  }
})

const _getData = (id, done) => {
  const params = {
    Bucket: USERS_BUCKET_NAME,
    Key: id
  }

  s3.getObject(params, (err, data) => {
    if (err) {
      done(err.message)
    }
    done(null, data.Body)
  })
}

export const getData = promisify(_getData)

const _put = (params, done) => {
  s3.putObject(params, (err, data) => {
    if (err) {
      done(err.message)
    }
    done(null, data)
  })
}

const put = promisify(_put)

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
  await put(params).catch((e) => done(e))
}

export const saveUser = promisify(_saveUser)

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
  await put(params).catch((e) => done(e))  
}

export const save = promisify(_save)

const _remove = (id, done) => {
  const params = {
    Bucket: USERS_BUCKET_NAME,
    Key: id
  }

  s3.deleteObject(params, (err, data) => {
    if (err) {
      done(err.message)
    }
    done(null, data)
  })
}

export const remove = promisify(_remove)

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
    }
    done(data)
  })
}

export const multiRemove = promisify(_multiRemove)

const _list = (dir, done) => {
  const params = {
    Bucket: USERS_BUCKET_NAME,
    MaxKeys: 100
  }

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      done(err.message)
    }
    done(null, data.Contents)
  })
}

export const listItems = promisify(_list)

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
    }
    done(null, data)
  })
}

export const setEncryption = promisify(_setEncryption)

const _upload = (name, key, stream, done) => {
  const params = { Bucket: name, Key: key, Body: stream }
  s3.upload(params, (err, data) => {
    if (err) {
      done(err.message)
    }
    done(null, data)
  })
}

export const upload = promisify(_upload)

s3db.getData = getData
s3db.saveUser = saveUser
s3db.save = save
s3db.remove = remove
s3db.multiRemove = multiRemove
s3db.listItems = listItems
export default s3db
