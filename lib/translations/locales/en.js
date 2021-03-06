export const en = {
  error: {
    unauthorized: 'Unauthorized.',
    not_allowed: 'Bad request.',
    server: 'Server error',
    email: 'Send email parameters missing or are invalid or could not send email.',
    phone: 'Send SMS parameters missing or are invalid.',
    required: 'Missing required fields.',
    confirmation_save: 'Unable to save confirmation code.',
    confirmation_generate: 'Unable to generate confirmation code.',
    no_user: 'No such user.',
    user_exists: 'User exists.',
    user_delete: 'Could not delete user.',
    confirmed: 'Account is not confirmed.',
    hash: 'Unable to hash password, please try again later.',
    user_create: 'Could not create user.',
    sms: 'Could not send SMS.',
    token_notfound: 'Token not found.',
    not_found: 'Not found.',
    token_expired: 'Token is expired.',
    token_invalid: 'Invalid token.',
    generate: 'Unable to generate password, please try again later.',
    invalid_password: 'Wrong login details.',
    id: 'Unable to generate ID.',
    token: 'Could not create token.',
    cannot_read: 'Cannot read.',
    cannot_update: 'Cannot Update',
    unknown: 'Unknown problem.',
    internal: 'Internal error',
    save: 'Save error.',
    refer_email: 'Cannot send referral email',
    wrong_token: 'Wrong token provided.',
    ref_reg: 'Referred user already registered.',
    hashing: 'Error hashing.',
    bytes: 'Error generating bytes.',
    join_delete: 'Error occurred when deleting some column from table.',
    no_payload: 'No payload.',
    invalid_email: 'Invalid email.',
    profile: 'There was an error getting the profile.',
    timeout: 'Request timed out.',
    fileType: 'Wrong file type, only png, jpeg and webp are accepted.',
    bad_request: 'Bad request.',
    token_delete: 'Error with confirmation token.',
    social_decline: 'Account email not verified or account is blocked.',
    notify: 'Error sending notifications.',
    invalid_user: 'Invalid user fields',
    encode: 'Error encoding buffer',
    decode: 'Error decoding buffer'
  },
  token: {
    expired: 'Token expired.'
  },
  account: {
    confirm_subject: 'Please confirm your account for {company}',
    confirm_message: 'Your code for <a href="{baseUrl}">{company}</a> account:<h4><a href="{baseUrl}confirm/{code}">{code}</a></h4>',
    confirm_phone: 'Your code for {company} account: {code}',
    reset_phone: 'Your code for {company} password reset: {code}'
  },
  ok: 'OK.',
  refer: {
    email: 'Click the following link: <a href="{baseUrl}refer/{token}">{token}</a>',
  },
  reset: {
    email: 'Please confirm your password reset for {company}',
    reset_email_text: 'Click here to confirm password reset: <h4><a href="{baseUrl}confirm-reset/{code}">{code}</a></h4>',
    email_password: 'Your new password for'
  }
}

export const langSchema = {
  title: 'English schema v.1.0',
  type: 'object',
  required: ['ok'],
  uniqueItems: true,
  properties: {
    error: {
      type: 'object'
    },
    token: {
      type: 'object'
    },
    account: {
      type: 'object'
    },
    refer: {
      type: 'object'
    },
    reset: {
      type: 'object'
    },
    ok: {
      type: 'string'
    }
  }
}
