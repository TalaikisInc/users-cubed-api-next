import { t } from '../translations'
import API_KEY from '../../config'
import { sendError } from '../utils'

export const validRequest = (req) => {
  if (typeof req.headers.authorization === 'string') {
    const token = req.headers.authorization.replace('Bearer ', '')
    if (token.length === 64 && token === API_KEY) {
      return true
    }
    return false
  }
  return false
}

export const apiAuth = (api) => {
  api.use((req, res, next) => {
    const valid = validRequest(req)
    if (valid) {
      req.authorized = true
      next()
    }
    sendError(res, 403, t('error.unauthorized'))
  })
}
