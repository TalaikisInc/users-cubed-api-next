import { promisify } from 'util'

import { DB_TYPE } from '../../config'
import db from './functions'
import { t } from '../translations'

const _joinedTableDelete = (table, col, done) => {
  const toDelete = col.length
  if (toDelete > 0) {
    let deleted = 0
    let errors = false
    col.forEach((id) => {
      db.destroy(table, id, (err) => {
        if (!err) {
          deleted += 1
        } else {
          errors = true
        }

        if (deleted === toDelete) {
          if (!errors) {
            done()
          } else {
            done(t('error.join_delete'))
          }
        }
      })
    })
  } else {
    done()
  }
}

export const joinedTableDelete = promisify(_joinedTableDelete)

export default DB_TYPE === 's3' ? db : {}
