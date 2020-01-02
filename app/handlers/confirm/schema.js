import { object, string } from 'yup'

import { LANGUAGES } from '../../config'

export const confirmSchema = object().shape({
  token: string().required().length(64),
  locale: string().required().oneOf(LANGUAGES)
})
