import isBase64 from 'validator/lib/isBase64'

import { t } from '../translations'

export const encoder = (handler, output, done) => {
  if (typeof handler === 'object' && output) {
    try {
      const buffer = handler.encode(output)
      const encoded = buffer.toString('base64')
      if (isBase64(encoded)) {
        done(null, encoded)
      } else {
        done(t('error.encode'))
      }
    } catch (e) {
      done(e)
    }
  } else {
    done(t('error.encode'))
  }
}

export const decoder = (handler, encoded, done) => {
  try {
    if (typeof handler === 'object' && isBase64(encoded)) {
      const object = handler.decode(Buffer.from(encoded, 'base64'))
      done(null, object)
    } else {
      done(t('error.decode'))
    }
  } catch (e) {
    done(e)
  }
}
