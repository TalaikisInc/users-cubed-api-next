import ACTIONS from '../actions'

export default {
  [ACTIONS.USER.CREATE]: import('./users').gen,
  [ACTIONS.USER.CREATE_SOCIAL]: import('./users').createSocial,
  [ACTIONS.USER.EDIT]: import('./users').edit,
  [ACTIONS.USER.DESTROY]: import('./users').destroyUser,
  [ACTIONS.USER.GET]: import('./users').get,
  [ACTIONS.USER.CONFIRM_PHONE]: import('./users').confirmPhone,
  [ACTIONS.USER.SET_ROLE]: import('./users').setRole,
  [ACTIONS.TOKEN.CREATE]: import('./token').gen,
  [ACTIONS.TOKEN.EXTEND]: import('./token').extend,
  [ACTIONS.TOKEN.DESTROY]: import('./token').destroy,
  [ACTIONS.TOKEN.GET]: import('./token').get,
  [ACTIONS.CONFIRM]: import('./confirm').default,
  [ACTIONS.REFER.REFER]: import('./refer').refer,
  [ACTIONS.REFER.USE]: import('./refer').use,
  [ACTIONS.REFER.REGISTER]: import('./refer').register,
  [ACTIONS.RESET.CREATE]: import('./reset').default,
  [ACTIONS.PING]: import('./generics/ping').default,
  [ACTIONS.NOT_FOUND]: import('./generics/notFound').default
}
