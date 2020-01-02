import { response } from './app/lib/utils'

module.exports.handler = async (event, context, callback) => {
  await response(event, callback)
}
