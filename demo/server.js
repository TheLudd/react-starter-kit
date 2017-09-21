const fs = require('fs')
const path = require('path')
const browserify = require('browserify')
const babelify = require('babelify')
const watchify = require('watchify')
const connect = require('connect')
const serveStatic = require('serve-static')
const mkdirp = require('mkdirp')

const baseDir = path.normalize(__dirname)
const entryPath = path.normalize(path.join(__dirname, 'bootstrap.jsx'))
const distFolder = path.join(baseDir, 'dist')
const bundlePath = path.join(distFolder, 'bundle.js')

mkdirp.sync(distFolder)
const b = browserify({
  entries: [entryPath],
  cache: {},
  packageCache: {},
  plugin: [watchify],
  transform: [babelify]
})

b.on('update', bundle)
bundle()

function bundle () {
  b.bundle(function (e, buf) {
    if (e != null) {
      console.log(e)
    } else {
      fs.writeFileSync(bundlePath, buf)
      console.log(`Wrote ${buf.length} bytes to ${bundlePath}`)
    }
  })
}

const server = connect()
const port = 3000
const demoPath = __dirname

server.use(serveStatic(demoPath))

server.listen(port, function () {
  console.log('Demo server running on port', port)
})

const livereload = require('livereload')
const lrServer = livereload.createServer()
lrServer.watch(demoPath)
