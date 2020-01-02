import { object, string } from 'yup'

import { LANGUAGES } from '../../config'

export const resetSchema = object().shape({
  email: string().required().email(),
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})
