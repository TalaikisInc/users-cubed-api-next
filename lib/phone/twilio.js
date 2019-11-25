import { strictEqual } from 'assert'

import { TWILIO } from '../../config'
import request from '../utils/requests'
import { t } from '../translations'

strictEqual(typeof TWILIO.sid, 'string')
strictEqual(typeof TWILIO.authToken, 'string')

export default (phone, msg, done) => {
  const validPhone = typeof phone === 'string' && phone.length >= 11 ? phone : false
  const validMsg = typeof msg === 'string' && msg.trim().length > 0 ? msg.trim() : false

  if (validPhone && validMsg) {
    const obj = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${TWILIO.sid}/Messages.json`,
      data: {
        From: TWILIO.from,
        To: `+${phone}`,
        Body: msg
      },
      headers: {
        Authorization: `Basic ${Buffer.from(`${TWILIO.sid}:${TWILIO.authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    request('https', obj, (err) => {
      if (!err) {
        done(false)
      } else {
        done(err)
      }
    })
  } else {
    done({ error: t('error.phone') })
  }
}
