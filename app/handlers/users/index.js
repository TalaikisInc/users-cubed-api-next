import { promisify } from 'util'
import jwtDecode from 'jwt-decode'

import { read, update, create, destroy, joinDelete } from '../../lib/db'
import { user, countries } from '../../lib/schemas'
import { COMPANY, BASE_URL, FIRST_CONFIRM } from '../../config'
import { randomID, hash, auth } from '../../lib/security'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import { t, setLocale } from '../../lib/translations'
import { createSchema, userUpdate, userDestroy, userGet, socialSchema, setRoleSchema } from './schema'
import { sendError, sendOk, validEmail, sendUser, loose } from '../../lib/utils'

const _sendEmailConfirmation = async (email, done) => {
  const token = await randomID(32).catch(() => done(t('error.confirmation_generate')))
  const subject = t('account_confirm_subject', { company: COMPANY })
  const msg = t('account_confirm_message', { company: COMPANY, baseUrl: BASE_URL, code: token })
  const obj = {
    email,
    token,
    type: FIRST_CONFIRM,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await create('confirms', token, obj).catch(() => done(t('error.confirmation_save')))
  const e = await sendEmail(email, subject, msg).catch((e) => done(e))
  if (!e) {
    done(false)
  }
}

const sendEmailConfirmation = promisify(_sendEmailConfirmation)

const _sendPhoneConfirmation = async (phone, email, done) => {
  const token = await randomID(6).catch(() => done(t('error.confirmation_generate')))
  const msg = t('account_confirm_phone', { company: COMPANY, code: token })
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

const sendPhoneConfirmation = promisify(_sendPhoneConfirmation)

export const getUser = async (data, done) => {
  const valid = await userGet.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data).catch((e) => sendError(403, e, done))
    const userData = await read('users', tokenData.email).catch(async () => await sendError(400, t('error.cannot_read'), done))
    if (userData) {
      delete userData.password
      done(200, userData)
    }
    await sendError(400, t('error.no_user'), done)
  }
  await sendError(400, t('error.required'), done)
}

export const genUser = async (data, final) => {
  const valid = await createSchema.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const u = await user(data).catch(async () => await sendError(400, t('error.required'), final))
    if (u.email && u.password && u.tosAgreement) {
      await read('users', u.email).catch(async () => {
        const hashedPassword = await hash(obj.password).catch(async () => await sendError(400, t('error.hash'), final))
        if (hashedPassword) {
          const now = Date.now()
          const newObj = {
            firstName: u.firstName ? u.firstName : '',
            lastName: u.lastName ? u.lastName : '',
            dialCode: u.dialCode,
            phone: u.phone ? u.phone : '',
            email: u.email,
            tosAgreement: u.tosAgreement,
            password: hashedPassword,
            referred: [],
            address: u.address,
            zipCode: u.zipCode,
            city: u.city,
            country: u.country ? countries.filter(i => i === u.country).country : '',
            dob: u.dob,
            avatarUrl: u.avatarUrl,
            confirmed: {
              email: false,
              phone: false
            },
            social: {
              facebook: { id: '', nickName: '', picture: '' },
              twitter: { id: '', nickName: '', picture: '' },
              google: { id: '', nickName: '', picture: '' },
              linkedin: { id: '', nickName: '', picture: '' }
            },
            registeredAt: now,
            updatedAt: now,
            role: 'user'
          }

          await create('users', u.email, newObj).catch(async () => await sendError(400, t('error.user_create'), final))
          if (FIRST_CONFIRM === 'email') {
            const e = await sendEmailConfirmation(u.email).catch(async () => await sendError(400, t('error.email'), final))
            if (!e) {
              await sendOk(final)
            }
          }

          if (FIRST_CONFIRM === 'phone') {
            const e = await sendPhoneConfirmation(u.phone, u.email).catch(async () => await sendError(400, t('error.sms'), final))
            if (!e) {
              await sendOk(final)
            }
          }
        }
        await sendError(500, t('error.unknown'), final)
      })
      await sendError(500, t('error.user_exists'), final)
    }
    await sendError(400, t('error.required'), final)
  }
  await sendError(400, t('error.required'), final)
}

const _editFields = async (u, userData, done) => {
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
    const valid = await validEmail(u.email).catch((e) => done(e))
    if (valid) {
      userData.email = u.email
      const e = await sendEmailConfirmation(u.email).catch(() => done(t('error.email')))
      if (!e) {
        done(false)
      }
    }
  }

  userData.updatedAt = Date.now()

  if (u.password) {
    const hashed = await hash(u.password).catch(() => done(t('error.hash')))
    if (hashed) {
      userData.password = hashed
    }
  }
  done(null, userData)
}

const editFields = promisify(_editFields)

export const edit = async (data, done) => {
  const valid = await userUpdate.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data).catch(async () => await sendError(403, t('error.unauthorized'), done))
    const u = await loose(data, undefined).catch(async (e) => await sendError(400, e, done))
    const userData = await read('users', tokenData.email).catch(async () => await sendError(500, t('error.cannot_read'), done))
    if (userData.confirmed.email || userData.confirmed.phone) {
      const newData = await editFields(u, userData).catch(async () => await sendError(400, t('error.unknown'), done))
      if (newData) {
        await update('users', tokenData.email, newData).catch(async () => await sendError(500, t('error.cannot_update'), done))
        const returnUuser = await read('users', tokenData.email).catch(async () => await sendError(500, t('error.cannot_read'), done))
        if (returnUuser) {
          delete returnUuser.password
          await sendUser(returnUuser)
        }
        await sendError(500, t('error.cannot_read'), done)
      }
    }
    await sendError(400, t('error.confirmed'), done)
  }
  await sendError(400, t('error.required'), done)
}

export const destroyUser = async (data, done) => {
  const valid = await userDestroy.isValid(data.payload)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data).catch(async () => await sendError(403, t('error.unauthorized'), done))
    const userData = await read('users', tokenData.email).catch(async () => await sendError(403, t('error.cannot_read'), done))
    if (userData) {
      const refs = typeof userData.referred === 'object' && Array.isArray(userData.referred) ? userData.referred : []
      await destroy('users', tokenData.email).catch((e) => sendError(400, t('error.user_delete'), done))
      const e = await joinDelete('refers', refs)
      if (!e) {
        await sendOk()
      }
    }
    await sendError(400, t('error.no_user'), done)
  }
  await sendError(400, t('error.required'), done)
}

export const confirmPhone = (data, done) => {

}

const _getSocialProfile = (idToken, done) => {
  if (idToken) {
    try {
      done(null, jwtDecode(idToken))
    } catch (err) {
      done(t('error.profile'))
    }
  }
}

const getSocialProfile = promisify(_getSocialProfile)

const _signinSocial = async (data, done) => {
  /*
  const valid = await socialSchema.isValid(data.payload)
  if (valid) {
    const profile = await getSocialProfile(data.payload.idToken)
    const out = {
      idToken: data.payload.idToken,
      accessToken: data.payload.accessToken,
      nickname: profile.nickname,
      picture: profile.picture
    }
    // query user by tokenId
    // if not found - create new

    const now = Date.now()
    const newObj = {
      firstName: u.firstName ? u.firstName : '',
      lastName: u.lastName ? u.lastName : '',
      dialCode: u.dialCode,
      phone: u.phone ? u.phone : '',
      email: u.email,
      tosAgreement: u.tosAgreement,
      password: hashedPassword,
      referred: [],
      address: u.address,
      zipCode: u.zipCode,
      city: u.city,
      country: u.country ? countries.filter(i => i === u.country).country : '',
      dob: u.dob,
      avatarUrl: u.avatarUrl,
      confirmed: {
        email: false,
        phone: false
      },
      social: {
        facebook: { id: '', nickName: '', picture: '' },
        twitter: { id: '', nickName: '', picture: '' },
        google: { id: '', nickName: '', picture: '' },
        linkedin: { id: '', nickName: '', picture: '' }
      },
      registeredAt: now,
      updatedAt: now,
      role: 'user'
    }
  }
  await sendError(400, t('error.required'), done)
  */
}

export const signinSocial = promisify(_signinSocial)

export const setRole = async (data, done) => {
  const valid = await setRoleSchema.isValid(data.payload)
  if (valid) {
    const tokenData = await read('tokens', data.payload.tokenId).catch(async () => await sendError(403, t('error.unauthorized'), done))
    if (tokenData && tokenData.role === 'admin') {
      const userData = await read('users', tokenData.email).catch(async () => await sendError(400, t('error.no_user'), done))
      userData.role = data.payload.role
      await update('users', tokenData.email, userData).catch(async () => await sendError(403, t('error.cannot_update'), done))
      await sendOk()
    }
    await sendError(403, t('error.unauthorized'), done)
  }
  await sendError(400, t('error.required'), done)
}
