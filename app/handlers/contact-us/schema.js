import { object, string } from 'yup'

import { LANGUAGES } from '../../config'

export const contactUsSchema = object().shape({
  email: string().required().email(),
  name: string().required().min(5),
  msg: string().required().min(10),
  locale: string().required().oneOf(LANGUAGES)
})
