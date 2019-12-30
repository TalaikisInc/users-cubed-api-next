import { handlers } from './app/handlers'
import { protoResponse, decode } from './app/lib/proto'
import { apiAuth } from './app/lib/auth'
import { t } from './app/lib/translations'
import { sendError } from './app/lib/utils'

module.exports.handler = async (event, context, final) => {
  const payload = await decode(event).catch(async () => await sendError(400, t('error.bad_request'), final))
  const e = await apiAuth(payload)
  if (e) {
    const handler = typeof handlers[e.action] !== 'undefined' ? handlers[e.action] : handlers.NOT_FOUND
    const { status, out } = await handler.h(e).catch(async () => await sendError(500, t('error.server'), final))
    if (status && out) {
      await protoResponse(status, out, handler.file, handler.class, final)
    }
    await sendError(500, t('error.server'), final)
  }
  await sendError(403, t('error.unauthorized'), final)
}
