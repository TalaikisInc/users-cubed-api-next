import Handlebars from 'handlebars'

import sendMailgun from './mailgun'
import { EMAIL_PROVIDER } from '../../config'

export const compile = (source, data) => {
  const template = Handlebars.compile(source)
  return template(data)
}

export default EMAIL_PROVIDER === 'mailgun' ? sendMailgun : {}
