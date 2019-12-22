import { object, string } from 'yup'

export const createSchema = object().shape({
  email: string().required().email(),
  password: string().required().min(12),
  key: string().required(),
  action: string().required().oneOf(['TOKEN_CREATE']),
  locale: string().required().oneOf(['en', 'fr'])
})

export const tokenExtend = object().shape({
  tokenId: string().required().length(64),
  key: string().required(),
  action: string().required().oneOf(['TOKEN_EXTEND']),
  locale: string().required().oneOf(['en', 'fr'])
})

export const tokenDestroy = object().shape({
  tokenId: string().required().length(64),
  key: string().required(),
  action: string().required().oneOf(['TOKEN_DESTROY']),
  locale: string().required().oneOf(['en', 'fr'])
})

export const tokenGet = object().shape({
  tokenId: string().required().length(64),
  key: string().required(),
  action: string().required().oneOf(['TOKEN_GET']),
  locale: string().required().oneOf(['en', 'fr'])
})
