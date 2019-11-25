import Amplify from '@aws-amplify/core'
import Storage from '@aws-amplify/storage'
import Auth from '@aws-amplify/auth'
import { get } from 'axios'

import awsmobile from '../aws-exports'
Amplify.configure(awsmobile)
Storage.configure({ level: 'private' })

export const getData = (id, done) => {
  Storage.vault.get(id)
    .then((res) => {
      get(res).then((response) => {
        if (typeof response.data === 'object') {
          done(false, response.data)
        } else {
          done('No such data.')
        }
      }).catch((error) => {
        done(error)
      })
    })
    .catch((err) => done(err))
}

export const save = (id, data, done) => {
  data = typeof data === 'object' ? JSON.stringify(data) : false
  if (data) {
    Storage.put(id, data, {
      level: 'private',
      contentType: 'application/json'
    }).then((res) => done(false, res))
      .catch((err) => done(err))
  }
}

export const remove = (id, done) => {
  Storage.remove(id, { level: 'private' })
    .then((res) => done(false, res))
    .catch((err) => done(err))
}

export const list = (dir, done) => {
  Storage.list(`${dir}/`, { level: 'private' })
    .then((res) => done(false, res))
    .catch((err) => done(err))
}
