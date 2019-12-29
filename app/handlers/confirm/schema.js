import { object, string } from 'yup'

import { LANGUAGES } from '../../config'

export const confirmSchema = object().shape({
  token: string().required().length(64),
  key: string().required(),
  action: string().required().oneOf(['CONFIRM']),
  locale: string().required().oneOf(LANGUAGES)
})
