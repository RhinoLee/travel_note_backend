const KoaRouter = require('@koa/router')

const testRouter = new KoaRouter({ prefix: '/test' })

testRouter.get('/', (ctx, next) => {
  ctx.body = 'test CICD ROUND1'
})

module.exports = testRouter
