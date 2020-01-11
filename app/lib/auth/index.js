import { xss } from '../security'

export const validRequest = (headers) => {
  const valid = headers && typeof headers === 'object'
  const action = valid && headers.Action ? headers.Action : false
  if (action) return true
  return false
}

export const apiAuth = async (event) => {
  const valid = validRequest(event.headers)
  event.body = await xss(event.body)
  if (valid) return event
  return false
}
