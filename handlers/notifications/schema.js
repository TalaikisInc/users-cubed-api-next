import { object, string } from 'yup'

import { LANGUAGES } from '../../config'

export const setRoleSchema = object().shape({
  locale: string().required().oneOf(LANGUAGES)
})
