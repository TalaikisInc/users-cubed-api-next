import { notifySchema } from './schema'
import { t, setLocale } from '../../lib/translations'

// @TODO!!!
export const push = async (data, final) => {
  // for admins
  const valid = await notifySchema.isValid(data.body)
  if (valid) {
    
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

export const pushSubscribe = async (data, final) => {
  const valid = await notifySchema.isValid(data.body)
  if (valid) {
    // if no user exists - create only notif id user
    
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}
