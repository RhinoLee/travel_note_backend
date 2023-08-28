const KoaRouter = require('@koa/router')
const openAIController = require('../controllers/openAI.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

const openAIRouter = new KoaRouter({ prefix: '/openAI' })

openAIRouter.post('/createTripDay', verifyToken, openAIController.completion)

module.exports = openAIRouter
