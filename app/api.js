import { response } from './lib/utils'

module.exports.handler = async (event, context) => {
  return await response(event)
}
