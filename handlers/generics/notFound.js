import { t } from '../../lib/translations'

export default async (data, final) => {
  final(null, { s: 400, e: t('error.not_found') })
}
