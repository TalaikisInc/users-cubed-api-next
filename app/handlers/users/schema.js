import { object, string, bool } from 'yup'

import { LANGUAGES, ROLES, SOCIAL_PROVIDERS } from '../../config'

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
  locale: string().required().oneOf(LANGUAGES)
})

export const userDestroy = object().shape({
  locale: string().required().oneOf(LANGUAGES)
})

export const userGet = object().shape({
  locale: string().required().oneOf(LANGUAGES)
})

export const socialSchema = object().shape({
  provider: string().required().oneOf(SOCIAL_PROVIDERS),
  idToken: string().required().min(5),
  accessToken: string().required().min(5),
  locale: string().required().oneOf(LANGUAGES)
})

export const setRoleSchema = object().shape({
  role: string().required().oneOf(ROLES),
  locale: string().required().oneOf(LANGUAGES)
})
