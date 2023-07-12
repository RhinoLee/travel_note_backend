const KoaRouter = require('@koa/router')

const testRouter = new KoaRouter({ prefix: '/test' })

testRouter.get('/', (ctx, next) => {
  ctx.body = 'test router 123'
})

module.exports = testRouter