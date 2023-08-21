const KoaRouter = require('@koa/router')
const userController = require('../controllers/user.controller')
const { verifyUser, verifyEmailLogin } = require('../middlewares/user.middleware')
const { verifyToken } = require('../middlewares/auth.middleware')
const { checkUserEmail, getAuthorizationUrl } = require('../middlewares/googleLogin.middleware')

const userRouter = new KoaRouter({ prefix: '/user' })

// emai 註冊
userRouter.post('/', verifyUser, userController.create)
// email 登入
userRouter.post('/login', verifyEmailLogin, userController.login)
// google 第三方登入
userRouter.get('/google_login_url', getAuthorizationUrl, userController.googleLoginUrl)
userRouter.post('/google_login', checkUserEmail, userController.googleLogin)
// user info
userRouter.get('/', verifyToken, userController.getUserInfo)

module.exports = userRouter
