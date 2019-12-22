import { FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../config'

export const socialConfig {
  facebook: {
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET
  },
  google: {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET
  }
}

export const getProvider = (str) => {
  const s1 = str.split('|')[0]
  return s1.includes('-') ? s1.replace('-oauth2', '') : s1
}
