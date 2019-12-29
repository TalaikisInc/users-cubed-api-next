import { object, string } from 'yup'

import { LANGUAGES } from '../../config'

export const resetSchema = object().shape({
  email: string().required().email(),
  key: string().required(),
  action: string().required().oneOf(['RESET_CREATE']),
  locale: string().required().oneOf(LANGUAGES)
})
