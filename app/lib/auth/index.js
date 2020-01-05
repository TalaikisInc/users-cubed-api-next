import { xss } from '../security'
import { API_KEY } from '../../config'

export const validRequest = (event) => {
  const valid = event.headers && typeof event.headers === 'object'
  const accept = valid && event.headers['Accept'] ? event.headers['Accept'] : false
  const action = valid && event.headers['Action'] ? event.headers['Action'] : false
  const authorized = valid && event.headers['X-API-Key'] === API_KEY
  if (accept && accept === 'application/x-protobuf' && action && authorized) return true
  return false
}

export const apiAuth = async (event) => {
  const valid = validRequest(event)
  event.body = await xss(event.body)
  if (valid) return event
  return false
}
