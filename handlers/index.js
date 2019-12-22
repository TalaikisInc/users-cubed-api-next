import ACTIONS from '../actions'

export default {
  [ACTIONS.USER.CREATE]: { file: '', class: '', h: import('./users').gen },
  [ACTIONS.USER.CREATE_SOCIAL]: { file: '', class: '', h: import('./users').createSocial },
  [ACTIONS.USER.EDIT]: { file: '', class: '', h: import('./users').edit },
  [ACTIONS.USER.DESTROY]: { file: '', class: '', h: import('./users').destroyUser },
  [ACTIONS.USER.GET]: { file: '', class: '', h: import('./users').get },
  [ACTIONS.USER.CONFIRM_PHONE]: { file: '', class: '', h: import('./users').confirmPhone },
  [ACTIONS.USER.SET_ROLE]: { file: '', class: '', h: import('./users').setRole },
  [ACTIONS.TOKEN.CREATE]: { file: '', class: '', h: import('./token').gen },
  [ACTIONS.TOKEN.EXTEND]: { file: '', class: '', h: import('./token').extend },
  [ACTIONS.TOKEN.DESTROY]: { file: '', class: '', h: import('./token').destroy },
  [ACTIONS.TOKEN.GET]: { file: '', class: '', h: import('./token').get },
  [ACTIONS.CONFIRM]: { file: '', class: '', h: import('./confirm').default },
  [ACTIONS.REFER.REFER]: { file: '', class: '', h: import('./refer').refer },
  [ACTIONS.REFER.USE]: { file: '', class: '', h: import('./refer').use },
  [ACTIONS.REFER.REGISTER]: { file: '', class: '', h: import('./refer').register },
  [ACTIONS.RESET.CREATE]: { file: '', class: '', h: import('./reset').default },
  [ACTIONS.NOT_FOUND]: { file: '', class: '', h: import('./generics/notFound').default }
}
