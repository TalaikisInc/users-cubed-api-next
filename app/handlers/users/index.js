import { promisify } from 'util'
import jwtDecode from 'jwt-decode'

import db, { joinedTableDelete } from '../../lib/db'
import { user, countries } from '../../lib/schemas'
import { COMPANY, BASE_URL, FIRST_CONFIRM } from '../../config'
import { randomID, hash, auth } from '../../lib/security'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import { t, setLocale } from '../../lib/translations'
import { createSchema, userUpdate, userDestroy, userGet, socialSchema, setRoleSchema } from './schema'
import { sendErr, validEmail, loose } from '../../lib/utils'

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

  await db.create('confirms', token, obj).catch(() => done(t('error.confirmation_save')))
  const e = await sendEmail(email, subject, msg).catch((e) => done(e))
  if (!e) {
    done()
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
    const tokenData = await auth(data).catch((e) => final({ s: 403, e }))
    const userData = await db.read('users', tokenData.email).catch(() => final({ s: 400, e: t('error.cannot_read') }))
    if (userData) {
      delete userData.password
      final(null, { s: 200, userData })
    } else {
      final({ s: 400, e: t('error.no_user') })
    }
  } else {
    final({ s: 400, e: t('error.required') })
  }
}

export const genUser = async (data, final) => {
  const valid = await createSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const u = await user(data).catch(() => final({ s: 400, e: t('error.required') }))
    if (u.email && u.password && u.tosAgreement) {
      const exists = await db.read('users', u.email).catch(async () => {
        const hashedPassword = await hash(u.password).catch(() => final({ s: 400, e: t('error.hash') }))
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

          const userData = await db.create('users', u.email, newObj).catch(() => final({ s: 400, e: t('error.user_create') }))
          if (FIRST_CONFIRM === 'email') {
            // @FIXME
            const e = await sendEmailConfirmation(u.email).catch(() => final({ s: 400, e: t('error.email') }))
            console.log('e')
            console.log(e)
            if (!e) {
              final(null, { s: 200, o: { status: 'created' } })
            }
          }

          if (FIRST_CONFIRM === 'phone') {
            const e = await sendPhoneConfirmation(u.phone, u.email).catch(() => final({ s: 400, e: t('error.sms') }))
            if (!e) {
              final(null, { s: 200, o: { status: 'created' } })
            }
          }
        } else {
          final({ s: 500, e: t('error.unknown') })
        }
      })

      if (exists) {
        final({ s: 500, e: t('error.user_exists') })
      }
    } else {
      final({ s: 400, e: t('error.required') })
    }
  } else {
    final({ s: 400, e: t('error.required') })
  }
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
        done()
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

export const edit = async (data, final) => {
  const valid = await userUpdate.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data).catch(() => final({ s: 403, e: t('error.unauthorized') }))
    const u = await loose(data, undefined).catch(async (e) => final({ s: 400, e }))
    const userData = await db.read('users', tokenData.email).catch(() => final({ s: 500, e: t('error.cannot_read') }))
    if (userData.confirmed.email || userData.confirmed.phone) {
      const newData = await editFields(u, userData).catch(() => final({ s: 400, e: t('error.unknown') }))
      if (newData) {
        await db.update('users', tokenData.email, newData).catch(() => final({ s: 500, e: t('error.cannot_update') }))
        const returnUuser = await db.read('users', tokenData.email).catch(() => final({ s: 500, e: t('error.cannot_read') }))
        if (returnUuser) {
          delete returnUuser.password
          final(null, { s: 200, o: returnUuser })
        } else {
          final({ s: 500, e: t('error.cannot_read') })
        }
      }
    } else {
      final({ s: 400, e: t('error.confirmed') })
    }
  } else {
    final({ s: 400, e: t('error.required') })
  }
}

export const destroyUser = async (data, final) => {
  const valid = await userDestroy.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data).catch(() => final({ s: 403, e: t('error.unauthorized') }))
    const userData = await db.read('users', tokenData.email).catch(() => final({ s: 403, e: t('error.cannot_read') }))
    if (userData) {
      const refs = typeof userData.referred === 'object' && Array.isArray(userData.referred) ? userData.referred : []
      await db.destroy('users', tokenData.email).catch((e) => final({ s: 400, e: t('error.user_delete') }))
      const e = await joinedTableDelete('refers', refs)
      if (!e) {
        final(null, { s: 200, o: { status: 'ok' } })
      }
    } else {
      final({ s: 400, e: t('error.no_user') })
    }
  } else {
    final({ s: 400, e: t('error.required') })
  }
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

export const signinSocial = async (data, done) => {
  /*
  const valid = await socialSchema.isValid(data.body)
  if (valid) {
    const profile = await getSocialProfile(data.body.idToken)
    const out = {
      idToken: data.body.idToken,
      accessToken: data.body.accessToken,
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
  sendErr(400, t('error.required'), done)
  */
}

export const setRole = async (data, final) => {
  const valid = await setRoleSchema.isValid(data.body)
  if (valid) {
    const tokenData = await db.read('tokens', data.body.tokenId).catch(() => final({ s: 403, e: t('error.unauthorized') }))
    if (tokenData && tokenData.role === 'admin') {
      const userData = await db.read('users', tokenData.email).catch(() => final({ s: 400, e: t('error.no_user') }))
      userData.role = data.body.role
      await db.update('users', tokenData.email, userData).catch(() => final({ s: 403, e: t('error.cannot_update') }))
      final(null, { s: 200, o: { status: 'ok' } })
    } else {
      final({ s: 403, e: t('error.unauthorized') })
    }
  } else {
    final({ s: 400, e: t('error.required') })
  }
}
