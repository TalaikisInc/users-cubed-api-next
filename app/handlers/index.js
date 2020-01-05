import ACTIONS from '../actions'

export const handlers = {
  [ACTIONS.USER.CREATE]: { file: 'userCreate', class: 'UserCreate', h: require('./users').genUser },
  [ACTIONS.USER.CREATE_SOCIAL]: { file: 'userCreateSocial', class: 'UserCreateSocial', h: require('./users').signinSocial },
  [ACTIONS.USER.EDIT]: { file: 'userEdit', class: 'UserEdit', h: require('./users').edit },
  [ACTIONS.USER.DESTROY]: { file: 'userDestroy', class: 'UserDestroy', h: require('./users').destroyUser },
  [ACTIONS.USER.GET]: { file: 'userGet', class: 'UserGet', h: require('./users').getUser },
  [ACTIONS.USER.CONFIRM_PHONE]: { file: 'confirmPhone', class: 'ConfirmPhone', h: require('./users').confirmPhone },
  [ACTIONS.USER.SET_ROLE]: { file: 'setRole', class: 'SetRole', h: require('./users').setRole },
  [ACTIONS.TOKEN.CREATE]: { file: 'tokenCreate', class: 'TokenCreate', h: require('./token').gen },
  [ACTIONS.TOKEN.EXTEND]: { file: 'tokenExtend', class: 'TokenExtend', h: require('./token').extend },
  [ACTIONS.TOKEN.DESTROY]: { file: 'tokenDestroy', class: 'TokenDestroy', h: require('./token').destroy },
  [ACTIONS.TOKEN.GET]: { file: 'tokenGet', class: 'TokenGet', h: require('./token').get },
  [ACTIONS.CONFIRM]: { file: 'confirm', class: 'Confirm', h: require('./confirm').confirm },
  [ACTIONS.REFER.REFER]: { file: 'refer', class: 'Refer', h: require('./refer').refer },
  [ACTIONS.REFER.USE]: { file: 'referUse', class: 'ReferUse', h: require('./refer').use },
  [ACTIONS.REFER.REGISTER]: { file: 'referRegister', class: 'ReferRegister', h: require('./refer').register },
  [ACTIONS.RESET.CREATE]: { file: 'resetCreate', class: 'ResetCreate', h: require('./reset').default },

  [ACTIONS.SHOP.PRODUCTS_GET]: { file: 'resetCreate', class: 'ResetCreate', h: require('./shop').default },
  [ACTIONS.SHOP.PRODUCT_GET_BYID]: { file: 'resetCreate', class: 'ResetCreate', h: require('./shop').default },
  [ACTIONS.SHOP.CART_ADD]: { file: 'resetCreate', class: 'ResetCreate', h: require('./shop').default },
  [ACTIONS.SHOP.CART_REMOVE]: { file: 'resetCreate', class: 'ResetCreate', h: require('./shop').default },
  [ACTIONS.SHOP.CART_GET]: { file: 'resetCreate', class: 'ResetCreate', h: require('./shop').default },
  [ACTIONS.SHOP.WISHLIST_ADD]: { file: 'resetCreate', class: 'ResetCreate', h: require('./shop').default },
  [ACTIONS.SHOP.WISHLIST_REMOVE]: { file: 'resetCreate', class: 'ResetCreate', h: require('./shop').default },
  [ACTIONS.SHOP.WISHLIST_GET]: { file: 'resetCreate', class: 'ResetCreate', h: require('./shop').default },
  [ACTIONS.SHOP.CHECKOUT]: { file: 'resetCreate', class: 'ResetCreate', h: require('./shop').default },

  [ACTIONS.BLOG.ARTICLES_GET]: { file: 'resetCreate', class: 'ResetCreate', h: require('./blog').default },
  [ACTIONS.BLOG.ARTICLE_GET_BYTITLE]: { file: 'resetCreate', class: 'ResetCreate', h: require('./blog').default },
  [ACTIONS.BLOG.ARTICLE_GET_BYCATEGORY]: { file: 'resetCreate', class: 'ResetCreate', h: require('./blog').default },
  [ACTIONS.BLOG.ARTICLE_ADD]: { file: 'resetCreate', class: 'ResetCreate', h: require('./blog').default },
  [ACTIONS.BLOG.ARTICLE_EDIT]: { file: 'resetCreate', class: 'ResetCreate', h: require('./blog').default },
  [ACTIONS.BLOG.ARTICLE_DELETE]: { file: 'resetCreate', class: 'ResetCreate', h: require('./blog').default },
  [ACTIONS.BLOG.CATEGORY_ADD]: { file: 'resetCreate', class: 'ResetCreate', h: require('./blog').default },
  [ACTIONS.BLOG.CATEGORY_EDIT]: { file: 'resetCreate', class: 'ResetCreate', h: require('./blog').default },
  [ACTIONS.BLOG.CATEGORY_DELETE]: { file: 'resetCreate', class: 'ResetCreate', h: require('./blog').default },
  [ACTIONS.BLOG.CATEGORIES_GET]: { file: 'resetCreate', class: 'ResetCreate', h: require('./blog').default },

  [ACTIONS.UPLOAD]: { file: 'upload', class: 'Upload', h: require('./upload').default },
  [ACTIONS.CONTACT_US]: { file: 'contactUs', class: 'ContactUs', h: require('./contact-us').default },
  [ACTIONS.NOT_FOUND]: { file: 'notFound', class: 'NotFound', h: require('./generics/notFound').default },
  [ACTIONS.MODULE.CREATE]: { file: 'moduleCreate', class: 'ModuleCreate', h: require('./module').create },
  [ACTIONS.MODULE.MIGRATE]: { file: 'moduleMigrate', class: 'ModuleMigrate', h: require('./module').migrate },
  [ACTIONS.NOTIFY.PUSH]: { file: 'notify', class: 'Notify', h: require('./notifications').push },
  [ACTIONS.NOTIFY.SUBSCRIBE]: { file: 'notifySubscribe', class: 'NotifySubscribe', h: require('./notifications').pushSubscribe }
}

export const handlerSchema = {
  title: 'Handler schema v.1.0',
  type: 'object',
  required: [
    [ACTIONS.USER.CREATE],
    [ACTIONS.USER.CREATE_SOCIAL],
    [ACTIONS.USER.EDIT],
    [ACTIONS.USER.DESTROY],
    [ACTIONS.USER.GET],
    [ACTIONS.USER.CONFIRM_PHONE],
    [ACTIONS.USER.SET_ROLE],
    [ACTIONS.TOKEN.CREATE],
    [ACTIONS.TOKEN.EXTEND],
    [ACTIONS.TOKEN.DESTROY],
    [ACTIONS.TOKEN.GET],
    [ACTIONS.CONFIRM],
    [ACTIONS.REFER.REFER],
    [ACTIONS.REFER.USE],
    [ACTIONS.REFER.REGISTER],
    [ACTIONS.RESET.CREATE],
    [ACTIONS.SHOP.PRODUCTS_GET],
    [ACTIONS.SHOP.PRODUCT_GET_BYID],
    [ACTIONS.SHOP.CART_ADD],
    [ACTIONS.SHOP.CART_REMOVE],
    [ACTIONS.SHOP.CART_GET],
    [ACTIONS.SHOP.WISHLIST_ADD],
    [ACTIONS.SHOP.WISHLIST_REMOVE],
    [ACTIONS.SHOP.WISHLIST_GET],
    [ACTIONS.SHOP.CHECKOUT],
    [ACTIONS.BLOG.ARTICLES_GET],
    [ACTIONS.BLOG.ARTICLE_GET_BYTITLE],
    [ACTIONS.BLOG.ARTICLE_GET_BYCATEGORY],
    [ACTIONS.BLOG.ARTICLE_ADD],
    [ACTIONS.BLOG.ARTICLE_EDIT],
    [ACTIONS.BLOG.ARTICLE_DELETE],
    [ACTIONS.BLOG.CATEGORY_ADD],
    [ACTIONS.BLOG.CATEGORY_EDIT],
    [ACTIONS.BLOG.CATEGORY_DELETE],
    [ACTIONS.BLOG.CATEGORIES_GET],
    [ACTIONS.NOT_FOUND]
  ],
  properties: {
    [ACTIONS.USER.CREATE]: {
      type: 'object',
      required: ['file', 'class', 'h'],
      properties: {
        file: {
          type: 'string'
        },
        class: {
          type: 'string'
        },
        h: {
          type: 'function'
        }
      }
    },
    [ACTIONS.USER.CREATE_SOCIAL]: {
      type: 'object'
    },
    [ACTIONS.USER.EDIT]: {
      type: 'object'
    }
  }
}
