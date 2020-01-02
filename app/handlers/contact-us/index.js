import { sendEmail } from '../../lib/email'
import { t, setLocale } from '../../lib/translations'
import { sendErr, validEmail, sendOk } from '../../lib/utils'

export default async (data, final) => {
  const email = typeof data.body.email === 'string' ? data.body.email : false
  const msg = typeof data.body.msg === 'string' ? data.body.msg : false
  const name = typeof data.body.name === 'string' ? data.body.name : false
  const locale = typeof data.body.locale === 'string' ? data.body.locale : 'en'

  if (locale !== 'en') {
    await setLocale(locale)
  }

  if (email && msg && name) {
    const valid = await validEmail(email).catch(() => sendErr(400, t('error.invalid_email'), final))
    if (valid) {
      const subject = `Message from: ${name}`
      const e = await sendEmail(email, subject, msg)
      if (!e) {
        sendOk(final)
      }
    } else {
      sendErr(400, t('error.invalid_email'), final)
    }
  } else {
    sendErr(400, t('error.required'), final)
  }
}
