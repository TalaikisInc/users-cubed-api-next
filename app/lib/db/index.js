import { promisify } from 'util'

import { DB_TYPE } from '../../config'
import { read, create, update, destroy, listDir } from './functions'
import { t } from '../translations'

const _joinDelete = (table, col, done) => {
  const toDelete = col.length
  if (toDelete > 0) {
    let deleted = 0
    let errors = false
    col.forEach((id) => {
      delete (table, id, (err) => {
        if (!err) {
          deleted += 1
        } else {
          errors = true
        }

        if (deleted === toDelete) {
          if (!errors) {
            done(null, {})
          } else {
            done(t('error.join_delete'))
          }
        }
      })
    })
  } else {
    done(null, {})
  }
}

export const joinDelete = promisify(_joinDelete)

export default DB_TYPE === 's3' ? { read, create, update, destroy, listDir } : {}
