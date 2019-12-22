import { object, string } from 'yup'

export const referSchema = object().shape({
  to: string().required().email(),
  key: string().required(),
  action: string().required().oneOf(['REFER_REFER']),
  locale: string().required().oneOf(['en', 'fr'])
})

export const useSchema = object().shape({
  token: string().required().length(36),
  key: string().required(),
  action: string().required().oneOf(['REFER_USE']),
  locale: string().required().oneOf(['en', 'fr'])
})

export const registerSchema = object().shape({
  from: string().required().email(),
  token: string().required().length(36),
  key: string().required(),
  action: string().required().oneOf(['REFER_REGISTER']),
  locale: string().required().oneOf(['en', 'fr'])
})
