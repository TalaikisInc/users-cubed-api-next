import { promisify } from 'util'

import { COMPANY, BASE_URL, FIRST_CONFIRM } from '../../config'
import { read, create } from '../../lib/db'
import { user } from '../../lib/schemas'
import { randomID } from '../../lib/security'
import sendEmail from '../../lib/email'
import sendSMS from '../../lib/phone'
import { t, setLocale } from '../../lib/translations'
import { resetSchema } from './schema'
import { sendErr } from '../../lib/utils'

const _sendEmailReset = async (email, done) => {
  const token = await randomID(32).catch(() => done(t('error.confirmation_generate')))
  const subject = t('reset.email', { company: COMPANY })
  const msg = t('reset.email_text', { baseUrl: BASE_URL, code: token })
  const obj = {
    email,
    type: 'reset',
    token: token,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await db.create('confirms', token, obj).catch(() => done(t('error.confirmation_save')))
  const e = await sendEmail(email, subject, msg).catch((e) => done(e))
  if (!e) {
    done(null)
  }
}

const sendEmailReset = promisify(_sendEmailReset)

const _sendPhoneConfirmation = async (phone, email, done) => {
  const token = await randomID(6).catch(() => done(t('error.confirmation_generate')))
  const msg = t('account_reset_phone', { company: COMPANY, code: token })
  const obj = {
    email,
    type: 'reset',
    token: token,
    expiry: Date.now() + 1000 * 60 * 60
  }

  await db.create('confirms', token, obj).catch(() => done(t('error.confirmation_save')))
  const e = await sendSMS(phone, msg).catch((e) => done(e))
  if (!e) {
    done(null)
  }
}

const sendPhoneConfirmation = promisify(_sendPhoneConfirmation)

const _sendReset = async (email, phone, done) => {
  if (FIRST_CONFIRM === 'email') {
    await sendEmailReset(email).catch((e) => done(e))
    done(null)
  } else if (FIRST_CONFIRM === 'phone') {
    await sendPhoneConfirmation(phone, email).catch((e) => done(e))
    done(null)
  }
}

const sendReset = promisify(_sendReset)

export default async (data, done) => {
  const valid = await resetSchema.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const u = await user(data)
      .catch(() => sendErr(400, t('error.required'), done))
    if (u.email) {
      const userData = await db.read('users', u.email).catch(() => sendErr(400, t('error.no_user'), done))
      if (userData) {
        await sendReset(u.email, userData.phone).catch(() => sendErr(500, t('error.email'), done))
        return { status: 200, out: t('ok') }
      }
      sendErr(400, t('error.no_user'), done)
    }
    sendErr(400, t('error.required'), done)
  }
  sendErr(400, t('error.required'), done)
}
