const socialItem = {
  idToken: '',
  accessToken: '',
  nickname: '',
  picture: '',
  email: '',
  email_verified: '',
  given_name: '',
  family_name: '',
  name: '',
  phone_number: '',
  phone_verified: '',
  blocked: '',
  last_ip: '',
  created_at: '',
  updated_at: '',
  user_id: ''
}


const social = {
  auth0: socialItem,
  facebook: socialItem,
  twitter: socialItem,
  google: socialItem,
  linkedin: socialItem
}

module.exports.userObj = {
  firstName: '',
  lastName: '',
  dialCode: '',
  phone: '',
  email: '',
  tosAgreement: false,
  password: '',
  modules: {
    referred: [],
  },
  address: '',
  zipCode: '',
  city: '',
  country: '',
  dob: '',
  avatarUrl: '',
  confirmed: {
    email: false,
    phone: false
  },
  social,
  registeredAt: 0,
  updatedAt: 0,
  role: ''
}
