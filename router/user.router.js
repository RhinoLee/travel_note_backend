const KoaRouter = require('@koa/router')
const userController = require('../controllers/user.controller')
const { verifyUser } = require('../middlewares/user.middleware')

const userRouter = new KoaRouter({ prefix: '/user' })

userRouter.post('/', verifyUser, userController.create)

module.exports = userRouter
