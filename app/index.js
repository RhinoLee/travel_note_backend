const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const registerRouter = require('../router/index')

const app = new Koa()

app.use(bodyParser())
registerRouter(app)

module.exports = app
