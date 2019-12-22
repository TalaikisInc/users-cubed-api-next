import passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as TwitterStrategy } from 'passport-twitter'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'
import { AuthenticationClient } from 'auth0'

import { socialConfig, getProvider } from './socialConfig'
import { joinDelete } from '../../lib/db'
import { read, update, create, destroy } from '../../lib/db/functions'
import { user } from '../../lib/data/userObj'
import { looseAsync } from '../../lib/data/loose'
import config from '../../config'
import { randomID, hash } from '../../lib/security'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import log from '../../lib/debug/log'
import error from '../../lib/debug/error'
import { auth } from '../../lib/security'
import { t, setLocale } from '../../lib/translations'
import countries from '../../lib/data/countries'
import { createSchema, userUpdate, userDestroy, userGet, socialSchema, setRoleSchema } from './schema'
import { sendError, validEmail } from '../../lib/utils'

const _sendEmailConfirmation = async (email, done) => {
  const token = await randomID(32).catch(() => done(t('error.confirmation_generate')))
  const subject = t('account_confirm_subject', { company: config.company })
  const msg = t('account_confirm_message', { company: config.company, baseUrl: config.baseUrl, code: token })
  const obj = {
    email,
    token,
    type: config.mainConfirm,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await create('confirms', token, obj)
    .catch(() => done(t('error.confirmation_save')))
  const e = await sendEmail(email, subject, msg)
    .catch((e) => done(e))
  if (!e) {
    done(false)
  }
}

const sendEmailConfirmation = promisify(_sendEmailConfirmation)

const sendPhoneConfirmation = async (phone, email, done) => {
  const token = await randomID(6).catch(() => done(t('error.confirmation_generate')))
  const msg = t('account_confirm_phone', { company: config.company, code: token })
  const obj = {
    email,
    token,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await create('confirms', token, obj).catch(() => done(t('error.confirmation_save')))
  sendSMS(phone, msg, (err) => {
    if (!err.error) {
      done(false)
    } else {
      done(err)
    }
  })
}

export const get = async (data, done) => {
  const valid = await userGet.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data)
      .catch((e) => sendError(403, e, done))
    const userData = await read('users', tokenData.email)
      .catch(() => done(404, { error: t('error.cannot_read') }))
    if (userData) {
      delete userData.password
      done(200, userData)
    } else {
      done(404, { error: t('error.no_user') })
    }
  } else {
    await sendError(400, t('error.required'), done)
  }
}

const createUser = async (obj, done) => {
  const hashedPassword = await hash(obj.password).catch(() => done(t('error.hash')))
  if (hashedPassword) {
    const now = Date.now()
    const newObj = {
      firstName: obj.firstName ? obj.firstName : '',
      lastName: obj.lastName ? obj.lastName : '',
      dialCoode: obj.dialCode,
      phone: obj.phone ? obj.phone : '',
      email: obj.email,
      tosAgreement: obj.tosAgreement,
      password: hashedPassword,
      referred: [],
      address: obj.address,
      zipCode: obj.zipCode,
      city: obj.city,
      country: obj.country ? countries.filter(i => i === obj.country).country : '',
      dob: obj.dob,
      avatarUrl: obj.avatarUrl,
      confirmed: {
        email: false,
        phone: false
      },
      social: {
        facebook: '',
        twitter: '',
        google: '',
        linkedin: ''
      },
      registeredAt: now,
      updatedAt: now,
      role: 'user'
    }

    await create('users', obj.email, newObj).catch(() => done(t('error.user_create')))
    if (config.mainConfirm === 'email') {
      await sendEmailConfirmation(obj.email, (err) => {
        if (!err.error) {
          done(false)
        } else {
          done(t('error.email'))
        }
      })
    }

    if (config.mainConfirm === 'phone') {
      await sendPhoneConfirmation(obj.phone, obj.email, (err) => {
        if (!err.error) {
          done(false)
        } else {
          done(t('error.sms'))
        }
      })
    }
  }
}

export const gen = async (data, done) => {
  const valid = await createSchema.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const u = await user(data).catch(() => await sendError(400, t('error.required'), done))
    if (u.email && u.password && u.tosAgreement) {
      await read('users', u.email).catch(async () => {
        await createUser(u, (err) => {
          if (!err) {
            done(200, { status: t('ok') })
          } else {
            done(500, { error: err })
          }
        })
      })
    } else {
      await sendError(400, t('error.required'), done)
    }
  } else {
    await sendError(400, t('error.required'), done)
  }
}

const editFields = async (u, userData, done) => {
  if (u.firstName !== userData.firstName) {
    userData.firstName = u.firstName
  }

  if (u.address !== userData.address) {
    userData.address = u.address
  }

  if (u.city !== userData.city) {
    userData.city = u.city
  }

  if (u.country !== userData.country) {
    userData.country = u.country
  }

  if (u.lastName !== userData.lastName) {
    userData.lastName = u.lastName
  }

  if (u.avatarUrl !== userData.avatarUrl) {
    userData.avatarUrl = u.avatarUrl
  }

  if (u.dob !== userData.dob) {
    userData.dob = u.dob
  }

  if (u.zipCode !== userData.zipCode) {
    userData.zipCode = u.zipCode
  }

  if (u.dialCode !== userData.dialCode) {
    userData.dialCode = u.dialCode
  }

  if (u.phone !== userData.phone) {
    userData.phone = u.phone
  }

  if (u.email !== userData.email) {
    const valid = await validEmail(u.email)
      .catch((e) => done(e))
    if (valid) {
      userData.email = u.email
      await sendEmailConfirmation(u.email, (err) => {
        if (!err) {
          log('Email sent.')
        } else {
          error(err)
        }
      })
    }
  }

  userData.updatedAt = Date.now()

  if (u.password) {
    const hashed = await hash(u.password).catch(() => done(t('error.hash')))
    if (hashed) {
      userData.password = hashed
    }
  }
  done(false, userData)
}

const _update = async (data, tokenData, done) => {
  const u = await looseAsync(data, undefined).catch(() => await sendError(400, t('error.required'), done))
  const userData = await read('users', tokenData.email).catch(() => done(500, { error: t('error.cannot_read') }))
  if (userData.confirmed.email || userData.confirmed.phone) {
    await editFields(u, userData, async (err, newData) => {
      if (!err && newData) {
        await update('users', tokenData.email, newData).catch(() => done(500, { error: t('error.cannot_update') }))
        const returnUuser = await read('users', tokenData.email).catch(() => done(500, { error: t('error.cannot_read') }))
        if (returnUuser) {
          delete returnUuser.password
          done(200, returnUuser)
        } else {
          done(500, { error: t('error.cannot_read') })
        }
      } else {
        done(500, { error: t('error.unknown') })
      }
    })
  } else {
    done(400, { error: t('error.confirmed') })
  }
}

export const edit = async (data, done) => {
  const valid = await userUpdate.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data)
      .catch(() => sendError(403, t('error.unauthorized'), done))
    await _update(data, tokenData, (status, outData) => {
      done(status, outData)
    })
  } else {
    await sendError(400, t('error.required'), done)
  }
}

export const destroyUser = async (data, done) => {
  const valid = await userDestroy.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data)
      .catch(() => sendError(403, t('error.unauthorized'), done))
    const userData = await read('users', tokenData.email)
      .catch(() => done(400, { error: t('error.cannot_read') }))
    if (userData) {
      const refs = typeof userData.referred === 'object' && Array.isArray(userData.referred) ? userData.referred : []
      await destroy('users', tokenData.email)
        .catch((e) => sendError(400, t('error.user_delete'), done))
      const e = await joinDelete('refers', refs)
      if (!e) {
        return { status: 200, out: t('ok')}
      }
    }
    await sendError(400, t('error.no_user'), done)
  }
  await sendError(400, t('error.required'), done)
}

export const confirmPhone = (data, done) => {

}

const facebook = async (data, done) => {
  passport.use(new FacebookStrategy({
    clientID: socialConfig.facebook.clientID,
    clientSecret: socialConfig.facebook.clientSecret,
    callbackURL: socialConfig.facebook.callbackURL }, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    const userData = await read('users', profile.email).catch(async () => {
      const now = Date.now()
      const u = {
        profile,
        firstName: '',
        lastName: '',
        dialCoode: '',
        phone: '',
        email: '',
        tosAgreement: true,
        referred: [],
        address: '',
        zipCode: '',
        city: '',
        country: '',
        dob: '',
        avatarUrl: '',
        confirmed: {
          email: true,
          phone: false
        },
        social: {
          facebook: profile.id,
          twitter: '',
          google: '',
          linkedin: ''
        },
        registeredAt: now,
        updatedAt: now,
        role: 'user'
      }

      await createUser(u, (err) => {
        if (!err) {
          done(200, { status: t('ok') })
        } else {
          done(500, { error: err })
        }
      })
    })
    userData.social.facebook = profile.id
    // update existing user
  }))
}

const twitter = async (data, done) => {
  passport.use(new TwitterStrategy({
    consumerKey: socialConfig.twitter.consumerKey,
    consumerSecret: socialConfig.twitter.consumerSecret,
    callbackURL: socialConfig.twitter.callbackURL }, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    const userData = await read('users', profile.email).catch(async () => {
      const now = Date.now()
      const u = {
        profile,
        firstName: '',
        lastName: '',
        dialCoode: '',
        phone: '',
        email: '',
        tosAgreement: true,
        referred: [],
        address: '',
        zipCode: '',
        city: '',
        country: '',
        dob: '',
        avatarUrl: '',
        confirmed: {
          email: true,
          phone: false
        },
        social: {
          facebook: '',
          twitter: profile.id,
          google: '',
          linkedin: ''
        },
        registeredAt: now,
        updatedAt: now,
        role: 'user'
      }

      await createUser(u, (err) => {
        if (!err) {
          done(200, { status: t('ok') })
        } else {
          done(500, { error: err })
        }
      })
    })
    userData.social.twitter = profile.id
    // update existing user
  }))
}

const google = async (data, done) => {
  passport.use(new GoogleStrategy({
    clientID: socialConfig.google.clientID,
    clientSecret: socialConfig.google.clientSecret,
    callbackURL: socialConfig.google.callbackURL }, async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    const userData = await read('users', profile.email).catch(async () => {
      const now = Date.now()
      const u = {
        profile,
        firstName: '',
        lastName: '',
        dialCoode: '',
        phone: '',
        email: '',
        tosAgreement: true,
        referred: [],
        address: '',
        zipCode: '',
        city: '',
        country: '',
        dob: '',
        avatarUrl: '',
        confirmed: {
          email: true,
          phone: false
        },
        social: {
          facebook: '',
          twitter: '',
          google: profile.id,
          linkedin: ''
        },
        registeredAt: now,
        updatedAt: now,
        role: 'user'
      }

      await createUser(u, (err) => {
        if (!err) {
          done(200, { status: t('ok') })
        } else {
          done(500, { error: err })
        }
      })
    })
    userData.social.google = profile.id
    // update existing user
  }))
}

export const createSocial = async (data, done) => {
  const auth0 = new AuthenticationClient({
    domain: `${process.env.AUTH0_DOMAIN}.auth0.com`,
    clientId: process.env.AUTH0_CLIENT_ID
  })
  const userData = {
    email: '',
    password: '',
    connection: 'Username-Password-Authentication' // Optional field.
  }

  auth0.database.signUp(userData, (err, userData) => {
    if (err) {
      // Handle error.
    }
  
    console.log(userData)
  })
  getProvider()
  /*
  {
  "sub": "facebook|10157485502176273",
  "given_name": "Tadas",
  "family_name": "Talaikis",
  "nickname": "Tadas Talaikis",
  "name": "Tadas Talaikis",
  "picture": "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=10157485502176273&height=50&width=50&ext=1579378603&hash=AeQxNK4ESP5Ta15W",
  "updated_at": "2019-12-19T20:16:43.246Z"
}
{
  "sub": "google-oauth2|109422141347468311528",
  "given_name": "Tadas",
  "family_name": "Talaikis",
  "nickname": "talaikis.tadas",
  "name": "Tadas Talaikis",
  "picture": "https://lh3.googleusercontent.com/a-/AAuE7mAgS6E48waGreTfPXVzRFzpBCKj5i_YnBvbv9EYdQ",
  "locale": "en",
  "updated_at": "2019-12-19T20:19:21.257Z"
}
  */
  const valid = await socialSchema.isValid(data.payload)
  if (valid) {
    const provider = data.payload.provider
    switch (provider) {
      case 'facebook':
        await facebook(data, (status, data) => done(status, data))
        break
      case 'twitter':
        await twitter(data, (status, data) => done(status, data))
        break
      case 'google':
        await google(data, (status, data) => done(status, data))
        break
      default:
        console.log()
    }
  } else {
    await sendError(400, t('error.required'), done)
  }
}

export const signinSocial = async (data, done) => {
  const auth0 = new AuthenticationClient({
    domain: `${process.env.AUTH0_DOMAIN}.auth0.com`,
    clientId: process.env.AUTH0_CLIENT_ID
  })
  const userData = {
    client_id: '{CLIENT_ID}',  // Optional field.
    username: '{USERNAME}',
    password: '{PASSWORD}',
    connection: '{CONNECTION_NAME}',
    scope: 'openid'  // Optional field.
  }
  auth0.oauth.signIn(userData, (err, userData) => {
    if (err) {
      // Handle error.
    }
  
    console.log(userData);
  })
}

export const setRole = async (data, done) => {
  const valid = await setRoleSchema.isValid(data.payload)
  if (valid) {
    const tokenData = await read('tokens', data.payload.tokenId).catch(() => done(403, { error: t('unauthorized') }))
    if (tokenData && tokenData.role === 'admin') {
      let userData = await read('users', tokenData.email).catch(() => done(403, { error: t('error.no_user') }))
      userData.role = data.payload.role
      await update('users', tokenData.email, userData).catch(() => done(403, { error: t('error.cannot_update') }))
      done(200, { status: t('ok') })
    } else {
      done(403, { error: t('unauthorized') })
    }
  } else {
    await sendError(400, t('error.required'), done)
  }
}
