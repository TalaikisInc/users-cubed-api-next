const { resolve } = require('path')
require('@babel/polyfill')
require('@babel/register')({
  presets: ['@babel/preset-env']
})
require('dotenv').config({ path: resolve(__dirname, '../.env.production') })

module.exports = require('./app.js')
