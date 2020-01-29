const { join } = require('path')
const { readFileSync, writeFileSync, readdir } = require('fs')
const protobuf = require('protocol-buffers')

const compileDir = (dir) => {
  const d = join(__dirname, '../schemas', dir)
  console.log(d)
  readdir(d, (err, files) => {
    if (err) throw err
    files.forEach((file) => {
      const s = file.split('.')
      if (s[1] === 'proto') {
        console.log(`Compiling ${file}`)
        const js = protobuf.toJS(readFileSync(join(d, file)))
        writeFileSync(join(d, `${s[0]}.js`), js)
      }
    })
  })
}

const compileAll = () => {
  compileDir('requests')
  compileDir('responses')
}

compileAll()
