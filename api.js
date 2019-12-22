import handlers from './handlers'
import { protoResponse, decode } from './lib/proto'
import { apiAuth } from './lib/auth'
import { t } from './lib/translations'
import { sendError } from './lib/utils'

module.exports.handler = async (event, context, callback) => {
  const _event = await apiAuth(event)
  if (_event) {
    const payload = await decode(_event)
      .catch(async () => sendError(400, t('error.bad_request'), callback))
    const handler = typeof handlers[payload.action] !== 'undefined' ? handlers[payload.action] : handlers.NOT_FOUND
    const { status, out } = await handler.h(payload)
      .catch(() => sendError(500, t('error.server'), callback))
    if (status && out) {
      await protoResponse(status, out, handler.file, handler.class, callback)
    }
    await sendError(500, t('error.server'), callback)
  }
  await sendError(403, t('error.unauthorized'), callback)
}
