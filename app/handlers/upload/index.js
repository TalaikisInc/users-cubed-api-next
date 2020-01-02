import db from '../../lib/db'
import { sendErr } from '../../lib/utils'
import { randomID } from '../../lib/security'
import { UPLOAD_TABLE } from '../../config'
import { t, setLocale } from '../../lib/translations'
const accceptedTypes = ['image/png', 'image/jpeg', 'image/webp']

export default async (data, final) => {
  const length = Object.keys(data.files).length
  await setLocale(data)
  if (length) {
    const file = data.files.file
    if (accceptedTypes.includes(file.mimetype)) {
      const ext = file.name.split('.')[1]
      const id = await randomID().catch(() => sendErr(500, t('error.bytes'), final))
      const fileName = `${id}.${ext}`
      await db.create(UPLOAD_TABLE, fileName, file.data).catch(async (e) => sendErr(500, e, final))
    } else {
      sendErr(400, t('error.fileType'), final)
    }
  } else {
    sendErr(400, t('error.required'), final)
  }
}
