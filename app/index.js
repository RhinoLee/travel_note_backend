const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const registerRouter = require('../router/index')
const multerErrorHandler = require('../middlewares/multerErrorHandler.middleware')

const app = new Koa()

app.use(bodyParser())
multerErrorHandler(app)
registerRouter(app)

module.exports = app
