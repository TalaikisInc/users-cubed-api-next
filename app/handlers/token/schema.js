import { object, string } from 'yup'

import { LANGUAGES } from '../../config'

export const createSchema = object().shape({
  email: string().required().email(),
  password: string().required().min(12),
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})

export const tokenExtend = object().shape({
  tokenId: string().required().length(64),
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})

export const tokenDestroy = object().shape({
  tokenId: string().required().length(64),
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})

export const tokenGet = object().shape({
  tokenId: string().required().length(64),
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})
