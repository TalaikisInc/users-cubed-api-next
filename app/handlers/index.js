import ACTIONS from '../actions'

export default {
  [ACTIONS.USER.CREATE]: { file: 'userCreate.proto', class: 'cubed.UserCreate', h: import('./users').genUser },
  [ACTIONS.USER.CREATE_SOCIAL]: { file: 'userCreateSocial.proto', class: 'cubed.UserCreateSocial', h: import('./users').signinSocial },
  [ACTIONS.USER.EDIT]: { file: 'userEdit.proto', class: 'cubed.UserEdit', h: import('./users').edit },
  [ACTIONS.USER.DESTROY]: { file: 'userDestroy.proto', class: 'cubed.UserDestroy', h: import('./users').destroyUser },
  [ACTIONS.USER.GET]: { file: 'userGet.proto', class: 'cubed.UserGet', h: import('./users').getUser },
  [ACTIONS.USER.CONFIRM_PHONE]: { file: 'confirmPhone.proto', class: 'cubed.ConfirmPhone', h: import('./users').confirmPhone },
  [ACTIONS.USER.SET_ROLE]: { file: 'userSetRole.proto', class: 'cubed.UserSetRole', h: import('./users').setRole },
  [ACTIONS.TOKEN.CREATE]: { file: 'tokenCreate.proto', class: 'cubed.TokenCreate', h: import('./token').gen },
  [ACTIONS.TOKEN.EXTEND]: { file: 'tokenExtend.proto', class: 'cubed.TokenExtend', h: import('./token').extend },
  [ACTIONS.TOKEN.DESTROY]: { file: 'tokenDestroy.proto', class: 'cubed.TokenDestroy', h: import('./token').destroy },
  [ACTIONS.TOKEN.GET]: { file: 'tokenGet.proto', class: 'cubed.TokenGet', h: import('./token').get },
  [ACTIONS.CONFIRM]: { file: 'confirm.proto', class: 'cubed.Confirm', h: import('./confirm').default },
  [ACTIONS.REFER.REFER]: { file: 'refer.proto', class: 'cubed.Refer', h: import('./refer').refer },
  [ACTIONS.REFER.USE]: { file: 'referUse.proto', class: 'cubed.ReferUse', h: import('./refer').use },
  [ACTIONS.REFER.REGISTER]: { file: 'referRegister.proto', class: 'cubed.ReferRegister', h: import('./refer').register },
  [ACTIONS.RESET.CREATE]: { file: 'resetCreate.proto', class: 'cubed.ResetCreate', h: import('./reset').default },
  [ACTIONS.NOT_FOUND]: { file: 'notFound.proto', class: 'cubed.NotFound', h: import('./generics/notFound').default }
}
