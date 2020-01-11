import { object, string } from 'yup'

import { LANGUAGES } from '../../config'

export const uploadSchema = object().shape({
  name: string().required().min(5),
  mimetype: string().required().min(5),
  data: string().required().min(10),
  locale: string().required().oneOf(LANGUAGES)
})
