import { promisify } from 'util'
import AWS from 'aws-sdk'

import { SNS_PHONE_TOPIC } from '../../config'
const sns = new AWS.SNS()

export const _sns = async (phone, msg, done) => {
  sns.publish({
    Message: msg,
    Subject: SNS_PHONE_TOPIC,
    PhoneNumber: phone
  }, (err, data) => {
    if (!err && data) {
      done(null, data)
    } else {
      done(err.message)
    }
  })
}

export default promisify(_sns)
