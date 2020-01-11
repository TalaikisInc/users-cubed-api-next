import { MOBILE_PROVIDER } from '../../config'
import sendTwilio from './twilio'

export default MOBILE_PROVIDER === 'twilio' ? sendTwilio : {}
