const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const testRouter = require('../router/test.router')

const app = new Koa()

app.use(bodyParser())
app.use(testRouter.routes())
app.use(testRouter.allowedMethods())

module.exports = app
