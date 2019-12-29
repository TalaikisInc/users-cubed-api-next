import { promisify } from 'util'

import { getData, save, remove, listItems } from '../s3'
const dataLib = {}

dataLib.create = async (dir, file, data, done) => {
  const res = await save(`${dir}/${file}`, data)
    .catch((e) => done(e))
  done(null, res)
}

dataLib.read = async (dir, file, done) => {
  const res = await getData(`${dir}/${file}`)
    .catch((e) => done(e))
  done(null, res)
}

dataLib.update = async (dir, file, newData, done) => {
  const res = await getData(`${dir}/${file}`)
    .catch((e) => done(e))
  if (res) {
    await remove(`${dir}/${file}`)
      .catch((e) => done(e))
    const res2 = await save(`${dir}/${file}`, newData)
      .catch((e) => done(e))
    done(null, res2)
  }
}

dataLib.delete = async (dir, file, done) => {
  const res = await remove(`${dir}/${file}`)
    .catch((e) => done(e))
  done(null, res)
}

dataLib.list = async (dir, done) => {
  const res = await listItems(`${dir}/`)
    .catch((e) => done(e))
  done(null, res)
}

export const create = promisify(dataLib.create)
export const read = promisify(dataLib.read)
export const update = promisify(dataLib.update)
export const destroy = promisify(dataLib.delete)
export const list = promisify(dataLib.list)

export default dataLib
