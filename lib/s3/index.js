let _module
if (process.env.NODE_ENV === 'testing') {
  _module = require('./mock').default
} else {
  _module = require('./s3').default
}

export default _module
