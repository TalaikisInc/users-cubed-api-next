import { MOBILE_PROVIDER } from '../../config'
let _module
if (MOBILE_PROVIDER === 'twilio') {
  _module = require('./twilio').default
} else {
  _module = require('./sns').default
}

export default _module
