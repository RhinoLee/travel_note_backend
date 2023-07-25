const fs = require('fs')

function registerRouter(app) {
  // read all files in router folder
  const files = fs.readdirSync(__dirname)

  for (const file of files) {
    if (!file.endsWith('.router.js')) continue
    const router = require(`./${file}`)
    app.use(router.routes())
    app.use(router.allowedMethods())
  }
}

module.exports = registerRouter
