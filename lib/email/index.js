import sendMailgun from './mailgun'
import { EMAIL_PROVIDER} from '../../config'

export default EMAIL_PROVIDER === 'mailgun' ? sendMailgun : {}
