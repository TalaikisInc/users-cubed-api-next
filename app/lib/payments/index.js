import stripe from './stripe'
import { PAYMENT_PROVIDER } from '../../config'

export default PAYMENT_PROVIDER === 'stripe' ? stripe : {}
