import { sendErr } from '../../lib/utils'
import { t } from '../../lib/translations'

export default async (data, final) => {
  final({ s: 400, e: t('error.not_found') })
}
