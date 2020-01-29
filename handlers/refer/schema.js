import { object, string } from 'yup'

import { LANGUAGES } from '../../config'

export const referSchema = object().shape({
  to: string().required().email(),
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})

export const useSchema = object().shape({
  token: string().required().length(36),
  locale: string().required().oneOf(LANGUAGES)
})

export const registerSchema = object().shape({
  from: string().required().email(),
  token: string().required().length(36),
  locale: string().required().oneOf(LANGUAGES)
})
