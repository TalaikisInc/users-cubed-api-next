import db from '../../lib/db'
import { randomID } from '../../lib/security'
import { UPLOAD_TABLE } from '../../config'
import { t, setLocale } from '../../lib/translations'
import { uploadSchema } from './schema'
const accceptedTypes = ['image/png', 'image/jpeg', 'image/webp']

export default async (data, final) => {
  const valid = uploadSchema.isValid(data.body)
  await setLocale(data)
  if (valid) {
    const file = data.body
    if (accceptedTypes.includes(file.mimetype)) {
      const ext = file.name.split('.')[1]
      const id = await randomID().catch(() => final(null, { s: 500, e: t('error.bytes') }))
      const fileName = `${id}.${ext}`
      await db.create(UPLOAD_TABLE, fileName, file.data).catch((e) => final(null, { s: 500, e }))
      final(null, { s: 200, o: { status: 'ok', fileName } })
    } else {
      final(null, { s: 400, e: t('error.fileType') })
    }
  } else {
    final(null, { s: 400, e: t('error.required') })
  }
}
