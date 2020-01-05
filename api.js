import { response } from './app/lib/utils'

module.exports.handler = async (event) => {
  return await response(event)
}
