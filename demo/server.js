var fs = require('fs')
var path = require('path')
var browserify = require('browserify')
var babelify = require('babelify')
var watchify = require('watchify')
var connect = require('connect')
var serveStatic = require('serve-static')
var mkdirp = require('mkdirp')

var baseDir = path.normalize(__dirname)
var entryPath = path.normalize(path.join(__dirname, 'bootstrap.jsx'))
var distFolder = path.join(baseDir, 'dist')
var bundlePath = path.join(distFolder, 'bundle.js')

mkdirp.sync(distFolder)
var b = browserify({
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

var server = connect()
var port = 3000
var demoPath = __dirname

server.use(serveStatic(demoPath))

server.listen(port, function () {
  console.log('Demo server running on port', port)
})

var livereload = require('livereload')
var lrServer = livereload.createServer()
lrServer.watch(demoPath)
