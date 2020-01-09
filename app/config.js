const { strictEqual } = require('assert')
strictEqual(typeof process.env.HASH_SECRET, 'string', 'You need hash secret!')
strictEqual(typeof process.env.TWILIO_FROM, 'string', 'You need Twilio from!')
strictEqual(typeof process.env.TWILIO_SID, 'string', 'You need TWILIO_SID!')
strictEqual(typeof process.env.TWILIO_AUTH_TOKEN, 'string', 'You need TWILIO_AUTH_TOKEN!')
strictEqual(typeof process.env.MAILGUN_FROM, 'string', 'You need MAILGUN_FROM!')
strictEqual(typeof process.env.MAILGUN_DOMAIN, 'string', 'You need MAILGUN_DOMAIN!')
strictEqual(typeof process.env.MAILGUN_KEY, 'string', 'You need MAILGUN_KEY!')
strictEqual(typeof process.env.ENCRYPTION_SALT, 'string', 'You need ENCRYPTION_SALT!')
strictEqual(typeof process.env.ENCRYPTION_PASSWORD, 'string', 'You need ENCRYPTION_PASSWORD!')
strictEqual(typeof process.env.BUCKET, 'string', 'You need USERS_BUCKET_NAME!')
strictEqual(typeof process.env.AUTH0_CLIENT_ID, 'string', 'You need AUTH0_CLIENT_ID!')
strictEqual(typeof process.env.AUTH0_DOMAIN, 'string', 'You need AUTH0_CLIENT_ID!')
strictEqual(typeof process.env.S3_ACCESS_KEY, 'string', 'You need S3_ACCESS_KEY!')
strictEqual(typeof process.env.S3_ACCESS_SECRET, 'string', 'You need S3_ACCESS_SECRET!')
strictEqual(typeof process.env.S3_REGION, 'string', 'You need S3_REGION!')
strictEqual(typeof process.env.API_KEY, 'string', 'You need API_KEY!')

export const MOBILE_PROVIDER = 'twilio'
export const EMAIL_PROVIDER = 'mailgun'
export const PAYMENT_PROVIDER = 'stripe'
export const DB_TYPE = 's3'
export const ROLES = ['user', 'admin', 'editor'] // 1st should be always default, 2nd - admin
export const FIRST_USER_ROLE = ROLES[1]
export const SOCIAL_PROVIDERS = ['auth0', 'google', 'facebook', 'twitter', 'linkedin']

export const WAPID_PUBLIC = process.env.WAPID_PUBLIC
export const WAPID_PRIVATE = process.env.WAPID_PRIVATE
export const WAPID_EMAIL = ''

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

export const BASE_URL = 'https://'

export const FIRST_CONFIRM = 'email'

export const USER_TOKEN_EXPIRY = 60 * 60 * 15

export const FRONTEND_URL = 'https://cubed.talaikis.com/'

export const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT

export const ENCRYPTION_PASSWORD = process.env.ENCRYPTION_PASSWORD

export const USERS_BUCKET_NAME = process.env.BUCKET

export const WORKERS = {
  tokenClean: 60 * 60,
  logRotate: 60 * 60 * 24,
  unconfirmedClean: 60 * 60 * 3
}

export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN
export const REDIRECT_URL = `${FRONTEND_URL}/dashboard`

export const LANGUAGES = ['en', 'fr']

export const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID
export const S3_ACCESS_SECRET = process.env.AWS_SECRET_ACCESS_KEY
export const S3_REGION = process.env.S3_REGION
export const UPLOAD_TABLE = 'avatars'

export const API_KEY = process.env.API_KEY
export const ALLOW_ORIGIN = '*'

export const STRIPE_TEST_SECRET = process.env.STRIPE_TEST_SECRET
export const STRIPE_LIVE_SECRET = process.env.STRIPE_LIVE_SECRET
export const STRIPE_ACCOUNT = ''
export const STRIPE_WEBHOOK_SECRET = ''
export const STRIPE_ENV = ''
