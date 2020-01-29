import middy from 'middy'
import stopInfinite from '@dazn/lambda-powertools-middleware-stop-infinite-loop'

import { responseConstructor } from './lib/proto'
import logTimeout from './lib/middleware/logger'

const _handler = async (event) => {
  const res = await responseConstructor(event)
  return res
}

const handler = middy(_handler)
  .use(stopInfinite())
  .use(logTimeout())

module.exports.handler = handler
