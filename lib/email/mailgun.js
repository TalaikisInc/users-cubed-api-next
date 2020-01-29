import { strictEqual } from 'assert'
import { promisify } from 'util'

import { MAILGUN } from '../../config'
import { request, validateMsg } from '../utils'
import { t } from '../translations'

strictEqual(typeof MAILGUN.domainName, 'string')
strictEqual(typeof MAILGUN.apiKey, 'string')
strictEqual(typeof MAILGUN.nameFrom, 'string')

export const _mailgun = async (email, subject, msg, template, done) => {
  const validMsg = validateMsg(msg)

  if (validMsg) {
    // const logo = createReadStream(join(__dirname, '../../.data', 'assets', 'logo.png'))
    // const htmlMsg = `<img src="cid:logo.png" width="200px"><br /><h3>${subject}</h3><p>${msg}</p>`

    const obj = {
      protocol: 'https:',
      hostname: 'api.mailgun.net',
      method: 'POST',
      path: `/v3/${MAILGUN.domainName}/messages`,
      auth: `api:${MAILGUN.apiKey}`,
      data: {
        from: `${MAILGUN.nameFrom} <info@${MAILGUN.domainName}>`,
        to: email,
        subject: subject,
        text: msg,
        html: msg
        // inline: [logo]
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    if (!(process.env.NODE_ENV === 'testing')) await request('https', obj).catch((e) => done(e))
    done()
  } else {
    done(t('error.email'))
  }
}

export default promisify(_mailgun)
