const KoaRouter = require('@koa/router')
const openAIController = require('../controllers/openAI.controller')
const { verifyUser } = require('../middlewares/user.middleware')

const openAIRouter = new KoaRouter({ prefix: '/openAI' })

openAIRouter.post('/completion', openAIController.completion)

module.exports = openAIRouter
