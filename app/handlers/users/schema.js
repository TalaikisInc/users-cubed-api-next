import { object, string, bool } from 'yup'

import { LANGUAGES } from '../../config'

export const createSchema = object().shape({
  email: string().required().email(),
  password: string().required().min(12),
  tosAgreement: bool().required(),
  firstName: string().transform((cv, ov) => ov === '' ? undefined : cv).min(3),
  lastName: string().transform((cv, ov) => ov === '' ? undefined : cv).min(3),
  dialCode: string().transform((cv, ov) => ov === '' ? undefined : cv).min(2),
  phone: string().transform((cv, ov) => ov === '' ? undefined : cv).min(8),
  address: string().transform((cv, ov) => ov === '' ? undefined : cv).min(5),
  zipCode: string().transform((cv, ov) => ov === '' ? undefined : cv).min(5),
  city: string().transform((cv, ov) => ov === '' ? undefined : cv).min(3),
  country: string().transform((cv, ov) => ov === '' ? undefined : cv).length(2),
  dob: string().transform((cv, ov) => ov === '' ? undefined : cv),
  avatarUrl: string().transform((cv, ov) => ov === '' ? undefined : cv).url(),
  locale: string().required().oneOf(LANGUAGES)
})

export const userUpdate = object().shape({
  email: string().transform((cv, ov) => ov === '' ? undefined : cv).email(),
  password: string().transform((cv, ov) => ov === '' ? undefined : cv).min(12),
  firstName: string().transform((cv, ov) => ov === '' ? undefined : cv).min(3),
  lastName: string().transform((cv, ov) => ov === '' ? undefined : cv).min(3),
  dialCode: string().transform((cv, ov) => ov === '' ? undefined : cv).min(2),
  phone: string().transform((cv, ov) => ov === '' ? undefined : cv).min(8),
  address: string().transform((cv, ov) => ov === '' ? undefined : cv).min(5),
  zipCode: string().transform((cv, ov) => ov === '' ? undefined : cv).min(5),
  city: string().transform((cv, ov) => ov === '' ? undefined : cv).min(3),
  country: string().transform((cv, ov) => ov === '' ? undefined : cv).length(2),
  dob: string().transform((cv, ov) => ov === '' ? undefined : cv),
  avatarUrl: string().transform((cv, ov) => ov === '' ? undefined : cv).url(),
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})

export const userDestroy = object().shape({
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})

export const userGet = object().shape({
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})

export const socialSchema = object().shape({
  provider: string().required().oneOf(['facebook', 'google', 'twitter']),
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})

export const setRoleSchema = object().shape({
  tokenId: string().required().length(64),
  role: string().required().oneOf(['user', 'admin', 'editor']),
  key: string().required(),
  locale: string().required().oneOf(LANGUAGES)
})
