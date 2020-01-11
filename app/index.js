require('@babel/polyfill')
require('@babel/register')({
  presets: ['@babel/preset-env']
})
require('dotenv').config({ path: './.env.production' })

module.exports = require('./api.js')
