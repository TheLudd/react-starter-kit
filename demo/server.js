const fs = require('fs')
const browserify = require('browserify')
const babelify = require('babelify')
const watchify = require('watchify')
const connect = require('connect')
const serveStatic = require('serve-static')
const mkdirp = require('mkdirp')
const less = require('less')
const NpmImportPlugin = require('less-plugin-npm-import')
const { normalize, join } = require('path')

const baseDir = normalize(__dirname)
const entryPath = normalize(join(__dirname, 'bootstrap.jsx'))
const distFolder = join(baseDir, 'dist')
const bundlePath = join(distFolder, 'bundle.js')
const libDir = normalize(join(baseDir, '..', 'lib'))

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

server.use('/style.css', (req, res) => {
  const lessFilePath = normalize(join(libDir, 'style.less'))
  const lessFileContent = fs.readFileSync(lessFilePath, 'utf-8')
  less.render(lessFileContent, {
    filename: lessFilePath,
    plugins: [ new NpmImportPlugin({prefix: '~'}) ]

  })
    .then((result) => {
      const { css } = result
      res.setHeader('Content-Type', 'text/css')
      res.end(css)
    })
    .catch((e) => {
      console.error(e)
      res.end(500, JSON.stringify(e, null, 2))
    })
})

server.listen(port, function () {
  console.log('Demo server running on port', port)
})

const livereload = require('livereload')
const lrServer = livereload.createServer({
  delay: 500,
  exts: [ 'jsx', 'less', 'js', 'css' ]
})
lrServer.watch([ libDir, demoPath ])
