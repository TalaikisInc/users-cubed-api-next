import { locale, fallback, set, t } from 'frenchkiss'
import { promisify } from 'util'

import { en } from './locales/en'
import { fr } from './locales/fr'

set('fr', fr)
set('en', en)

const _setLocale = (data, done) => {
  const loc = typeof data.body.locale === 'string' ? data.body.locale : 'en'
  locale(loc)
  done()
}

export const setLocale = promisify(_setLocale)

fallback('en')

export { t }
