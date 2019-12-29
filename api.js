import handlers from './app/handlers'
import { protoResponse, decode } from './app/lib/proto'
import { apiAuth } from './app/lib/auth'
import { t } from './app/lib/translations'
import { sendError } from './app/lib/utils'

module.exports.handler = async (event, context, callback) => {
  const authorizedEvent = await apiAuth(event)
  if (authorizedEvent) {
    const payload = await decode(authorizedEvent).catch(async () => await sendError(400, t('error.bad_request'), callback))
    const handler = typeof handlers[payload.action] !== 'undefined' ? handlers[payload.action] : handlers.NOT_FOUND
    const { status, out } = await handler.h(payload).catch(async () => await sendError(500, t('error.server'), callback))
    if (status && out) {
      await protoResponse(status, out, handler.file, handler.class, callback)
    }
    await sendError(500, t('error.server'), callback)
  }
  await sendError(403, t('error.unauthorized'), callback)
}
