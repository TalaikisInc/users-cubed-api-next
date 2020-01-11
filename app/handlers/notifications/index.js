import { subscribe } from '../../lib/notifications'
import { notifySchema } from './schema'
import { t, setLocale } from '../../lib/translations'

// @TODO!!!
export const push = async (data, final) => {
  // for admins
  const valid = await notifySchema.isValid(data.body)
  if (valid) {
    const tokenData = await auth(data).catch(() => final(null, { s: 403, e: t('error.unauthorized') }))
    await setLocale(data)
    await subscribe(data).catch(() => final(null, { s: 400, e: t('error.notify') }))
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

export const pushSubscribe = async (data, final) => {
  const valid = await notifySchema.isValid(data.body)
  if (valid) {
    // if no user exists - create only notif id user
    const tokenData = await auth(data).catch(() => final(null, { s: 403, e: t('error.unauthorized') }))
    await setLocale(data)
    // update user with subsription id
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}
