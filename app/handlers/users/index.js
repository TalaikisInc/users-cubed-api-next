import { promisify } from 'util'
import jwtDecode from 'jwt-decode'

import db, { joinedTableDelete } from '../../lib/db'
import { user, countries, loose } from '../../lib/schemas'
import { COMPANY, BASE_URL, ROLES, FIRST_CONFIRM, USER_TOKEN_EXPIRY } from '../../config'
import { randomID, hash, auth } from '../../lib/security'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import { t, setLocale } from '../../lib/translations'
import { createSchema, userUpdate, userDestroy, userGet, socialSchema, setRoleSchema } from './schema'
import { validEmail } from '../../lib/utils'

const _sendEmailConfirmation = async (email, done) => {
  const token = await randomID(32).catch(() => done(t('error.confirmation_generate')))
  const subject = t('account.confirm_subject', { company: COMPANY })
  const msg = t('account.confirm_message', { company: COMPANY, baseUrl: BASE_URL, code: token })
  const obj = {
    email,
    token,
    type: FIRST_CONFIRM,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await db.create('confirms', token, obj).catch(() => done(t('error.confirmation_save')))
  const e = await sendEmail(email, subject, msg).catch((e) => done(e))
  if (!e) {
    done()
  }
}

const sendEmailConfirmation = promisify(_sendEmailConfirmation)

const _sendPhoneConfirmation = async (phone, email, done) => {
  const token = await randomID(6).catch(() => done(t('error.confirmation_generate')))
  const msg = t('account.confirm_phone', { company: COMPANY, code: token })
  const obj = {
    email,
    token,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await db.create('confirms', token, obj).catch(() => done(t('error.confirmation_save')))
  const e = await sendSMS(phone, msg).catch((e) => done(e))
  if (!e) {
    done()
  }
}

const sendPhoneConfirmation = promisify(_sendPhoneConfirmation)

export const getUser = async (data, final) => {
  const valid = await userGet.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data).catch((e) => final(null, { s: 403, e }))
    if (tokenData) {
      const u = await db.read('users', tokenData.email).catch(() => final(null, { s: 400, e: t('error.cannot_read') }))
      delete u.password
      const o = {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        dialCode: u.dialCode,
        phone: u.phone,
        tosAgreement: u.tosAgreement,
        referred: u.referred,
        address: u.address,
        zipCode: u.zipCode,
        city: u.city,
        country: u.country,
        dob: u.dob,
        avatarUrl: u.avatarUrl,
        confirmed: u.confirmed,
        social: u.social,
        registeredAt: u.registeredAt,
        updatedAt: u.updatedAt,
        role: u.role
      }
      final(null, { s: 200, o })
    } else {
      final(null, { s: 400, e: t('error.no_user') })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

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

export const genUser = async (data, final) => {
  const valid = await createSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const u = await user(data).catch(() => final(null, { s: 400, e: t('error.required') }))
    if (u.email && u.password && u.tosAgreement) {
      const exists = await db.read('users', u.email).catch(async () => {
        const hashedPassword = await hash(u.password).catch(() => final(null, { s: 400, e: t('error.hash') }))
        if (hashedPassword) {
          const ls = await db.listDir('users').catch(() => final(null, { s: 400, e: t('error.user_create') }))
          const role = !ls || (ls && ls.length === 0) ? ROLES[1] : ROLES[0]
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
            social,
            registeredAt: now,
            updatedAt: now,
            role
          }

          await db.create('users', u.email, newObj).catch(() => final(null, { s: 400, e: t('error.user_create') }))
          if (FIRST_CONFIRM === 'email') {
            await sendEmailConfirmation(u.email).catch(() => final(null, { s: 400, e: t('error.email') }))
            final(null, { s: 200, o: { status: 'ok' } })
          }

          if (FIRST_CONFIRM === 'phone') {
            await sendPhoneConfirmation(u.phone, u.email).catch(() => final(null, { s: 400, e: t('error.sms') }))
            final(null, { s: 200, o: { status: 'ok' } })
          }
        } else {
          final(null, { s: 500, e: t('error.unknown') })
        }
      })

      if (exists) {
        final(null, { s: 500, e: t('error.user_exists') })
      }
    } else {
      final(null, { s: 400, e: t('error.required') })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

const _editFields = async (u, userData, done) => {
  if (u.firstName !== '' && u.firstName !== userData.firstName) {
    userData.firstName = u.firstName
  }

  if (u.lastName !== '' && u.lastName !== userData.lastName) {
    userData.lastName = u.lastName
  }

  if (u.address !== '' && u.address !== userData.address) {
    userData.address = u.address
  }

  if (u.city !== '' && u.city !== userData.city) {
    userData.city = u.city
  }

  if (u.country !== '' && u.country !== userData.country) {
    userData.country = u.country
  }

  if (u.avatarUrl !== '' && u.avatarUrl !== userData.avatarUrl) {
    userData.avatarUrl = u.avatarUrl
  }

  if (u.dob !== '' && u.dob !== userData.dob) {
    userData.dob = u.dob
  }

  if (u.zipCode !== '' && u.zipCode !== userData.zipCode) {
    userData.zipCode = u.zipCode
  }

  if (u.dialCode !== '' && u.dialCode !== userData.dialCode) {
    userData.dialCode = u.dialCode
  }

  if (u.phone !== '' && u.phone !== userData.phone) {
    userData.phone = u.phone
    await sendPhoneConfirmation(u.phone, userData.email).catch((e) => done(e))
  }

  if (u.email !== '' && u.email !== userData.email) {
    const valid = await validEmail(u.email).catch((e) => done(e))
    if (valid) {
      userData.email = u.email
      await sendEmailConfirmation(u.email).catch(() => done(t('error.email')))
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

export const edit = async (data, final) => {
  const valid = await userUpdate.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data).catch(() => final(null, { s: 403, e: t('error.unauthorized') }))
    const u = await loose(data, data.body.email).catch(async (e) => final(null, { s: 400, e }))
    const userData = await db.read('users', tokenData.email).catch(() => final(null, { s: 500, e: t('error.cannot_read') }))
    if (userData.confirmed.email || userData.confirmed.phone) {
      const newData = await editFields(u, userData).catch(() => final(null, { s: 400, e: t('error.unknown') }))
      if (newData) {
        await db.update('users', tokenData.email, newData).catch(() => final(null, { s: 500, e: t('error.cannot_update') }))
        const r = await db.read('users', tokenData.email).catch(() => final(null, { s: 500, e: t('error.cannot_read') }))
        if (r) {
          const o = {
            email: r.email,
            firstName: r.firstName,
            lastName: r.lastName,
            dialCode: r.dialCode,
            phone: r.phone,
            address: r.address,
            zipCode: r.zipCode,
            city: r.city,
            country: r.country,
            dob: r.dob,
            avatarUrl: r.avatarUrl,
            role: r.role
          }
          final(null, { s: 200, o })
        } else {
          final(null, { s: 500, e: t('error.cannot_read') })
        }
      }
    } else {
      final(null, { s: 400, e: t('error.confirmed') })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

export const destroyUser = async (data, final) => {
  const valid = await userDestroy.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data).catch(() => final(null, { s: 403, e: t('error.unauthorized') }))
    const userData = await db.read('users', tokenData.email).catch(() => final(null, { s: 403, e: t('error.cannot_read') }))
    if (userData) {
      const refs = typeof userData.referred === 'object' && Array.isArray(userData.referred) ? userData.referred : []
      await db.destroy('users', tokenData.email).catch(() => final(null, { s: 400, e: t('error.user_delete') }))
      const e = await joinedTableDelete('refers', refs).catch(() => final(null, { s: 400, e: t('error.join_delete') }))
      // @TODO for each user module - joindelete
      if (!e) {
        final(null, { s: 200, o: { status: 'ok' } })
      }
    } else {
      final(null, { s: 400, e: t('error.no_user') })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

export const confirmPhone = (data, done) => {

}

const _getSocialProfile = (idToken, done) => {
  if (idToken) {
    try {
      if (process.env.NODE_ENV === 'testing') {
        const now = Date.now()
        const out = {
          email: 'info@talaikis.com',
          email_verified: true,
          blocked: false,
          created_at: now,
          updated_at: now,
          user_id: 'test123'
        }
        done(null, out)
      } else {
        done(null, jwtDecode(idToken))
      }
    } catch (err) {
      done(t('error.profile'))
    }
  }
}

const getSocialProfile = promisify(_getSocialProfile)

const _getUserToken = async (email, role, done) => {
  const tokenId = await randomID(32).catch(() => done(t('error.id')))
  const expiry = Date.now() + 1000 * USER_TOKEN_EXPIRY
  const tokenObj = {
    expiry,
    tokenId,
    role,
    email
  }

  await db.create('tokens', tokenId, tokenObj).catch(() => done(t('error.token')))
  done(null, tokenId)
}

const getUserToken = promisify(_getUserToken)

export const signinSocial = async (data, final) => {
  await setLocale(data)
  const valid = await socialSchema.isValid(data.body)
  if (valid) {
    const profile = await getSocialProfile(data.body.idToken)
    const email = profile.email
    const emailVerified = profile.email_verified
    const blocked = profile.blocked
    const _validEmail = await validEmail(email).catch((e) => final(null, { s: 500, e }))

    if (blocked || !emailVerified || !_validEmail) {
      final(null, { s: 400, e: t('error.social') })
    } else {
      const u = await db.read('users', email).catch(async () => {
        const p = {
          idToken: data.body.idToken,
          accessToken: data.body.accessToken,
          nickname: profile.nickname,
          picture: profile.picture,
          email: email,
          email_verified: profile.email_verified,
          given_name: profile.given_name,
          family_name: profile.family_name,
          name: profile.name,
          phone_number: profile.phone_number,
          phone_verified: profile.phone_verified,
          blocked: profile.blocked,
          last_ip: profile.last_ip,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          user_id: profile.user_id
        }

        const now = Date.now()
        const newObj = {
          firstName: p.given_name,
          lastName: p.lastName ? u.lastName : '',
          dialCode: '',
          phone: '',
          email: p.email,
          tosAgreement: true,
          password: '',
          referred: [],
          address: '',
          zipCode: '',
          city: '',
          country: '',
          dob: '',
          avatarUrl: p.picture,
          confirmed: {
            email: true,
            phone: p.phone_verified
          },
          social: {
            auth0: p,
            facebook: socialItem,
            twitter: socialItem,
            google: socialItem,
            linkedin: socialItem
          },
          registeredAt: now,
          updatedAt: p.updated_at,
          role: ROLES[0]
        }

        await db.create('users', p.email, newObj).catch(() => final(null, { s: 400, e: t('error.user_create') }))
        const tokenId = await getUserToken(email, ROLES[0]).catch((e) => final(null, { s: 400, e }))
        final(null, { s: 200, o: { tokenId } })
      })

      if (u) {
        // @TODO update existing profile
        const tokenId = await getUserToken(u.email, u.role).catch((e) => final(null, { s: 400, e }))
        final(null, { s: 200, o: { tokenId } })
      }
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

export const setRole = async (data, final) => {
  const valid = await setRoleSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data).catch(() => final(null, { s: 403, e: t('error.unauthorized') }))
    if (tokenData && tokenData.role === ROLES[1]) {
      const userData = await db.read('users', tokenData.email).catch(() => final(null, { s: 400, e: t('error.no_user') }))
      userData.role = data.body.role
      tokenData.role = data.body.role
      await db.update('users', tokenData.email, userData).catch(() => final(null, { s: 403, e: t('error.cannot_update') }))
      await db.update('tokens', tokenData.tokenId, tokenData).catch(() => final(null, { s: 403, e: t('error.cannot_update') }))
      final(null, { s: 200, o: { status: 'ok' } })
    } else {
      final(null, { s: 403, e: t('error.unauthorized') })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

export const getUsers = (data, final) => {
  // only admins
}
