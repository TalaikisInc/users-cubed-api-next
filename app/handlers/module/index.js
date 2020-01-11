import db from '../../lib/db'
import { moduleCrete, moduleMigrate } from './schema'
import { t, setLocale } from '../../lib/translations'
import { auth } from '../../lib/security'
import { ROLES } from '../../config'

export const create = async (data, final) => {
  const valid = await moduleCrete.isValid(data.body)
  if (valid) {
    await setLocale(data)
    const tokenData = await auth(data).catch(() => final(null, { s: 403, e: t('error.unauthorized') }))
    if (tokenData.role !== ROLES[1]) {
      final(null, { s: 403, e: t('error.unauthorized') })
    } else {
      const schema = await db.read('schemas', 'user').catch(() => final(null, { s: 400, e: t('error.cannot_read') }))
      schema.modules[data.body.field] = []
      await db.update('schemas', 'user', schema).catch(() => final(null, { s: 500, e: t('error.cannot_update') }))
      final(null, { s: 200, o: { status: 'ok' } })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}

export const migrate = async (data, final) => {
  const valid = await moduleMigrate.isValid(data.body)
  // for each existing user - update its schema
  if (valid) {
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}
