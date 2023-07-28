const KoaRouter = require('@koa/router')
const userController = require('../controllers/user.controller')
const { verifyUser, verifyEmailLogin } = require('../middlewares/user.middleware')

const userRouter = new KoaRouter({ prefix: '/user' })

userRouter.post('/', verifyUser, userController.create)
userRouter.post('/login', verifyEmailLogin, userController.login)

module.exports = userRouter
