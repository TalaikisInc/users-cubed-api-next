import AWS from 'aws-sdk'
import { promisify } from 'util'

import { SES } from '../../config'
import { validateMsg } from '../utils'
import { t } from '../translations'
const ses = new AWS.SES({ apiVersion: '2010-12-01' })

export const _ses = async (email, subject, msg, template, done) => {
  const validMsg = validateMsg(msg)
  if (validMsg) {
    const params = {
      Destination: {
        ToAddresses: [email]
      },
      Template: template,
      TemplateData: JSON.stringify({
        subject,
        msg
      }),
      ConfigurationSetName: 'ConfigSet',
      Source: `info@${SES.domainName}`
    }

    const sendEmail = ses.sendTemplatedEmail(params).promise()
    sendEmail
      .then((data) => {
        done(null, data)
      })
      .catch((error) => {
        done(error.message)
      });
  } else {
    done(t('error.email'))
  }
}

export default promisify(_ses)
