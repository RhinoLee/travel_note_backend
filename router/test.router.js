const KoaRouter = require('@koa/router')
const testController = require('../controllers/test.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

const testRouter = new KoaRouter({ prefix: '/test' })

testRouter.get('/bigData', verifyToken, testController.getBigData)

module.exports = testRouter
