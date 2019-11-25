import { locale, fallback, set, t } from 'frenchkiss'
import { promisify } from 'util'

import en from './locales/en'
import fr from './locales/fr'

set('fr', fr)
set('en', en)

export const setLocale = (data, done) => {
  const loc = typeof data.payload.locale === 'string' ? data.payload.locale : 'en'
  locale(loc)
  done()
}

export const setLocaleAsync = promisify(setLocale)

fallback('en')

export { t }
