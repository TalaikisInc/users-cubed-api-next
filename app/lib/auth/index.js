import { xss } from '../security'

export const validRequest = async (event) => {
  const accept = event.headers.Accept
  if (accept === 'application/x-protobuf') {
    return true
  }
  return false
}

export const apiAuth = async (event) => {
  const valid = validRequest(event)
  const _event = await xss(event)
  if (valid) {
    return _event
  }
  return false
}
