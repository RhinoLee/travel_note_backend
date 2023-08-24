const KoaRouter = require('@koa/router')
const userController = require('../controllers/user.controller')
const {
  verifyUser,
  verifyEmailLogin,
  validateUserInfo,
  upload
} = require('../middlewares/user.middleware')
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
userRouter.put(
  '/',
  verifyToken,
  upload.single('avatar'),
  validateUserInfo,
  userController.updateUserInfo
)
// logout
userRouter.post('/logout', verifyToken, userController.logout)

// tripRouter.post('/', verifyToken, upload.single('tripImage'), validateTrip, tripController.create)

module.exports = userRouter
