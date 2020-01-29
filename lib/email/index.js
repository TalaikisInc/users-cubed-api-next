import { EMAIL_PROVIDER } from '../../config'
let _module
if (EMAIL_PROVIDER === 'mailgun') {
  _module = require('./mailgun').default
} else {
  _module = require('./ses').default
}

export default _module
