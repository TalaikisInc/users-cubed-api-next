import { handlers } from './app/handlers'
import { protoResponse, decode } from './app/lib/proto'
import { apiAuth } from './app/lib/auth'
import { t } from './app/lib/translations'
import { sendError } from './app/lib/utils'

module.exports.handler = async (event, context, final) => {
  // @TODO decode with headers here
  const payload = await decode(event.body).catch((e) => console.log(e))
  const e = await apiAuth(payload).catch((e) => console.log(e))
  if (e) {
    const handler = typeof handlers[e.action] !== 'undefined' ? handlers[e.action] : handlers.NOT_FOUND
    const { status, out } = await handler.h(e).catch(async () => await sendError(500, t('error.server'), final))
    if (status && out) {
      await protoResponse(status, out, handler.file, handler.class, final)
    } else {
      await sendError(500, t('error.server'), final)
    }
  } else {
    await sendError(403, t('error.unauthorized'), final)
  }
}
