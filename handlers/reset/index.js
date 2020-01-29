import { promisify } from 'util'

import { COMPANY, FRONTEND_URL, FIRST_CONFIRM } from '../../config'
import db from '../../lib/db'
import { user } from '../../lib/schemas'
import { randomID } from '../../lib/security'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import { t, setLocale } from '../../lib/translations'
import { resetSchema } from './schema'

const _sendEmailReset = async (email, done) => {
  const token = await randomID(32).catch(() => done(t('error.confirmation_generate')))
  const subject = t('reset.email', { company: COMPANY })
  const msg = t('reset.email_text', { baseUrl: FRONTEND_URL, code: token })
  const obj = {
    email,
    type: 'reset',
    token: token,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await db.create('confirms', token, obj).catch(() => done(t('error.confirmation_save')))
  const e = await sendEmail(email, subject, msg, 'PasswordReset').catch((e) => done(e))
  if (!e) {
    done()
  }
}

const sendEmailReset = promisify(_sendEmailReset)

const _sendPhoneConfirmation = async (phone, email, done) => {
  const token = await randomID(6).catch(() => done(t('error.confirmation_generate')))
  const msg = t('account.reset_phone', { company: COMPANY, code: token })
  const obj = {
    email,
    type: 'reset',
    token: token,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await db.create('confirms', token, obj).catch(() => done(t('error.confirmation_save')))
  const e = await sendSMS(phone, msg).catch((e) => done(e))
  if (!e) {
    done()
  }
}

const sendPhoneConfirmation = promisify(_sendPhoneConfirmation)

const _sendReset = async (email, phone, done) => {
  if (FIRST_CONFIRM === 'email') {
    await sendEmailReset(email).catch((e) => done(e))
    done()
  } else if (FIRST_CONFIRM === 'phone') {
    await sendPhoneConfirmation(phone, email).catch((e) => done(e))
    done()
  }
}

const sendReset = promisify(_sendReset)

export default async (data, final) => {
  const valid = await resetSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const u = await user(data).catch(() => final(null, { s: 400, e: t('error.required') }))
    if (u.email) {
      const userData = await db.read('users', u.email).catch(() => final(null, { s: 400, e: t('error.no_user') }))
      if (userData) {
        await sendReset(u.email, userData.phone).catch(() => final(null, { s: 500, e: t('error.email') }))
        final(null, { s: 200, o: { status: 'ok' } })
      } else {
        final(null, { s: 400, e: t('error.no_user') })
      }
    } else {
      final(null, { s: 400, e: t('error.required') })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}
