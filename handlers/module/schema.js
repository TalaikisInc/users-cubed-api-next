import { object, string } from 'yup'

import { LANGUAGES } from '../../config'

export const moduleCrete = object().shape({
  field: string().required().min(5),
  locale: string().required().oneOf(LANGUAGES)
})

export const moduleMigrate = object().shape({
  field: string().required().min(5),
  locale: string().required().oneOf(LANGUAGES)
})
