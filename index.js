require('@babel/polyfill')
require('@babel/register')({
  presets: ['@babel/preset-env']
})
require('dotenv').config({ path: './.env' })

module.exports = require('./index.js')
