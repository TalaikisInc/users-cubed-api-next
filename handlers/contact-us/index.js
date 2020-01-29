import { sendEmail } from '../../lib/email'
import { t, setLocale } from '../../lib/translations'
import { validEmail } from '../../lib/utils'
import { contactUsSchema } from './schema'

export default async (data, final) => {
  const valid = await contactUsSchema.isValid(data.body)

  if (valid) {
    const locale = data.body.locale
    if (locale !== 'en') {
      await setLocale(locale)
    }

    const _validEmail = await validEmail(data.body.email).catch(() => final(null, { s: 400, e: t('error.invalid_email') }))
    if (_validEmail) {
      const subject = `Message from: ${data.body.name}`
      const e = await sendEmail(_validEmail, subject, data.body.msg, 'ContactUs')
      if (!e) {
        final(null, { s: 200, o: { status: 'ok' } })
      }
    } else {
      final(null, { s: 400, e: t('error.invalid_email') })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}
