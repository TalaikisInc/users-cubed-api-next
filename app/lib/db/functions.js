import { promisify } from 'util'

import s3 from '../s3'
const db = {}

const _create = async (dir, file, data, done) => {
  const res = await s3.save(`${dir}/${file}`, data).catch((e) => done(e))
  done(null, res)
}

const _read = async (dir, file, done) => {
  const res = await s3.getData(`${dir}/${file}`).catch((e) => done(e))
  done(null, res)
}

const _update = async (dir, file, newData, done) => {
  const res = await s3.getData(`${dir}/${file}`).catch((e) => done(e))
  if (res) {
    await s3.remove(`${dir}/${file}`).catch((e) => done(e))
    const res2 = await s3.save(`${dir}/${file}`, newData).catch((e) => done(e))
    done(null, res2)
  }
}

const _delete = async (dir, file, done) => {
  await s3.remove(`${dir}/${file}`).catch((e) => done(e))
  done()
}

const _list = async (dir, done) => {
  const res = await s3.listItems(dir).catch((e) => done(e))
  done(null, res)
}

const create = promisify(_create)
const read = promisify(_read)
const update = promisify(_update)
const destroy = promisify(_delete)
const listDir = promisify(_list)

db.create = create
db.read = read
db.update = update
db.destroy = destroy
db.listDir = listDir

export default db
