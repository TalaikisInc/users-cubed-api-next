import handlers from './handlers'
import { toJson, sendError } from './lib/utils'
import { t } from './lib/translations'
import { apiAuth } from './lib/auth'
const config = {
  logger: {
    level: 'info',
    access: true,
    timestamp: () => new Date().toUTCString(),
    stack: false
  }
}
const api = require('lambda-api')(config)
apiAuth(api)

api.post('/', async (req, res) => {
  const payload = await toJson(req.body)
    .catch(() => sendError(res, 400, t('error.bad_request')))
  const handler = typeof handlers[payload.action] !== 'undefined' ? handlers[payload.action] : handlers.NOT_FOUND
  const { status, out } = await handler(payload)
    .catch(() => sendError(res, 500, t('error.server')))
  res.cors().status(status).json(out)
})

exports.handler = async (event, context) => {
  const res = await api.run(event, context)
  return res
}
