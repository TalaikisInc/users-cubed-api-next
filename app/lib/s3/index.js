import s3 from './s3'
import mock from './mock'

export default process.env.NODE_ENV === 'testing' ? mock : s3
