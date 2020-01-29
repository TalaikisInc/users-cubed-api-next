import ACTIONS from '../actions'

export const handlers = {
  [ACTIONS.USER.CREATE]: { class: 'UserCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./users').genUser },
  [ACTIONS.USER.CREATE_SOCIAL]: { class: 'UserCreateSocial', rf: require('../lib/schemas/responses/userCreateSocial.js').UserCreateSocial, h: require('./users').signinSocial },
  [ACTIONS.USER.EDIT]: { class: 'UserEdit', rf: require('../lib/schemas/responses/userEdit.js').UserEdit, h: require('./users').edit },
  [ACTIONS.USER.DESTROY]: { class: 'UserDestroy', rf: require('../lib/schemas/responses/userDestroy.js').UserDestroy, h: require('./users').destroyUser },
  [ACTIONS.USER.GET]: { class: 'UserGet', rf: require('../lib/schemas/responses/userGet.js').UserGet, h: require('./users').getUser },
  [ACTIONS.USER.CONFIRM_PHONE]: { class: 'ConfirmPhone', rf: require('../lib/schemas/responses/confirmPhone.js').ConfirmPhone, h: require('./users').confirmPhone },
  [ACTIONS.USER.SET_ROLE]: { class: 'SetRole', rf: require('../lib/schemas/responses/setRole.js').SetRole, h: require('./users').setRole },
  [ACTIONS.TOKEN.CREATE]: { class: 'TokenCreate', rf: require('../lib/schemas/responses/tokenCreate.js').TokenCreate, h: require('./token').gen },
  [ACTIONS.TOKEN.EXTEND]: { class: 'TokenExtend', rf: require('../lib/schemas/responses/tokenExtend.js').TokenExtend, h: require('./token').extend },
  [ACTIONS.TOKEN.DESTROY]: { class: 'TokenDestroy', rf: require('../lib/schemas/responses/tokenDestroy.js').TokenDestroy, h: require('./token').destroy },
  [ACTIONS.TOKEN.GET]: { class: 'TokenGet', rf: require('../lib/schemas/responses/tokenGet.js').TokenGet, h: require('./token').get },
  [ACTIONS.CONFIRM]: { class: 'Confirm', rf: require('../lib/schemas/responses/confirm.js').Confirm, h: require('./confirm').confirm },
  [ACTIONS.REFER.REFER]: { class: 'Refer', rf: require('../lib/schemas/responses/refer.js').Refer, h: require('./refer').refer },
  [ACTIONS.REFER.USE]: { class: 'ReferUse', rf: require('../lib/schemas/responses/referUse.js').ReferUse, h: require('./refer').use },
  [ACTIONS.REFER.REGISTER]: { class: 'ReferRegister', rf: require('../lib/schemas/responses/referRegister.js').ReferRegister, h: require('./refer').register },
  [ACTIONS.RESET.CREATE]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/resetCreate.js').ResetCreate, h: require('./reset').default },
  [ACTIONS.NOT_FOUND]: { class: 'NotFound', rf: require('../lib/schemas/responses/error.js').Error, h: require('./generics/notFound').default },
  // @TODO from this line
  // Shop
  [ACTIONS.SHOP.PRODUCTS_GET]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./shop').default },
  [ACTIONS.SHOP.PRODUCT_GET_BYID]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./shop').default },
  [ACTIONS.SHOP.CART_ADD]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./shop').default },
  [ACTIONS.SHOP.CART_REMOVE]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./shop').default },
  [ACTIONS.SHOP.CART_GET]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./shop').default },
  [ACTIONS.SHOP.WISHLIST_ADD]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./shop').default },
  [ACTIONS.SHOP.WISHLIST_REMOVE]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./shop').default },
  [ACTIONS.SHOP.WISHLIST_GET]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./shop').default },
  [ACTIONS.SHOP.CHECKOUT]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./shop').default },

  // Blog
  [ACTIONS.BLOG.ARTICLES_GET]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./blog').default },
  [ACTIONS.BLOG.ARTICLE_GET_BYTITLE]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./blog').default },
  [ACTIONS.BLOG.ARTICLE_GET_BYCATEGORY]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./blog').default },
  [ACTIONS.BLOG.ARTICLE_ADD]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./blog').default },
  [ACTIONS.BLOG.ARTICLE_EDIT]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./blog').default },
  [ACTIONS.BLOG.ARTICLE_DELETE]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./blog').default },
  [ACTIONS.BLOG.CATEGORY_ADD]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./blog').default },
  [ACTIONS.BLOG.CATEGORY_EDIT]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./blog').default },
  [ACTIONS.BLOG.CATEGORY_DELETE]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./blog').default },
  [ACTIONS.BLOG.CATEGORIES_GET]: { class: 'ResetCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./blog').default },

  // Other
  [ACTIONS.UPLOAD]: { class: 'Upload', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./upload').default },
  [ACTIONS.CONTACT_US]: { class: 'ContactUs', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./contact-us').default },
  [ACTIONS.MODULE.CREATE]: { class: 'ModuleCreate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./module').create },
  [ACTIONS.MODULE.MIGRATE]: { class: 'ModuleMigrate', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./module').migrate },
  [ACTIONS.NOTIFY.PUSH]: { class: 'Notify', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./notifications').push },
  [ACTIONS.NOTIFY.SUBSCRIBE]: { class: 'NotifySubscribe', rf: require('../lib/schemas/responses/userCreate.js').UserCreate, h: require('./notifications').pushSubscribe }
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
      required: ['class', 'h', 'rf'],
      properties: {
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
