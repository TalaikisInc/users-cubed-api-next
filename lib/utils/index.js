import { promisify } from 'util'

export const toJson = promisify((body, next) => {
  try {
    next(false, JSON.parse(body))
  } catch (e) {
    next(e)
  }
})

export const sendError = (res, code, msg) => {
  res
    .cors()
    .status(code)
    .json({ error: msg })
}
