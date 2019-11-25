const { strictEqual } = require('assert')
strictEqual(typeof process.env.HASH_SECRET, 'string', 'You need hash secret!')
strictEqual(typeof process.env.TWILIO_FROM, 'string', 'You need Twilio from!')
strictEqual(typeof process.env.TWILIO_SID, 'string', 'You need TWILIO_SID!')
strictEqual(typeof process.env.TWILIO_AUTH_TOKEN, 'string', 'You need TWILIO_AUTH_TOKEN!')
strictEqual(typeof process.env.MAILGUN_FROM, 'string', 'You need MAILGUN_FROM!')
strictEqual(typeof process.env.MAILGUN_DOMAIN, 'string', 'You need MAILGUN_DOMAIN!')
strictEqual(typeof process.env.MAILGUN_KEY, 'string', 'You need MAILGUN_KEY!')

export const API_KEY = process.env.API_KEY

export const MOBILE_PROVIDER = 'twilio'
export const EMAIL_PROVIDER = 'mailgun'

export const MAILGUN = {
  nameFrom: process.env.MAILGUN_FROM,
  domainName: process.env.MAILGUN_DOMAIN,
  apiKey: process.env.MAILGUN_KEY
}

export const TWILIO = {
  from: process.env.TWILIO_FROM,
  sid: process.env.TWILIO_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN
}

export const HASH_SECRET = process.env.HASH_SECRET

export const COMPANY = 'Talaikis Ltd.'

export const FIRST_CONFIRM = 'email'

export const USER_TOKEN_EXPIRY = 60 * 60

export const FRONTEND_URL = 'https://cubed.talaikis.com/'

export const WORKERS = {
  tokenClean: 60 * 60,
  logRotate: 60 * 60 * 24,
  unconfirmedClean: 60 * 60 * 3
}

export const FACEBOOK_CLIENT_ID = ''
export const FACEBOOK_CLIENT_SECRET = ''
export const TWITTER_CONSUMER_KEY = ''
export const TWITTER_CONSUMER_SECRET = ''
export const GOOGLE_CLIENT_ID = ''
export const GOOGLE_CLIENT_SECRET = ''
