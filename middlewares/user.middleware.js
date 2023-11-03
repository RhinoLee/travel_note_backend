const {
  REGISTER_NAME_ERROR,
  EMAIL_OR_PASSWORD_ERROR,
  EMAIL_IS_ALREADY_EXISTS
} = require('../config/constants/errorConstants/userErrorConstants')
const { passwordRegex } = require('../config/patterns')
const userService = require('../services/user.service')
const emailValidator = require('email-validator')
const errorHandler = require('../utils/errorHandlers/userErrorHandler')

const multer = require('@koa/multer')
const { object, string } = require('yup')
const createValidationMiddleware = require('../utils/createValidationMiddleware')

const imageRegex = /^image\/(jpe?g|png|gif|webp)$/i
const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file) return cb(null, true)
    if (imageRegex.test(file.mimetype.toLowerCase())) {
      return cb(null, true)
    } else {
      // 錯誤會透過全域 multerErrorHandler.middleware 處理
      return cb(null, false, new Error('Only image files are allowed!'))
    }
  }
})

const userInfoSchema = object({
  avatar: string().nullable(),
  name: string().required()
})

const validateUserInfo = createValidationMiddleware(userInfoSchema)

const verifyUser = async (ctx, next) => {
  const { name, password, email } = ctx.request.body

  if (!name) return errorHandler(REGISTER_NAME_ERROR, ctx)

  // email 註冊驗證
  if (!password || !email) return errorHandler(REGISTER_EMAIL_OR_PASSWORD_ERROR, ctx)

  if (!emailValidator.validate(email)) return errorHandler(REGISTER_EMAIL_OR_PASSWORD_ERROR, ctx)

  if (!passwordRegex.test(password)) return errorHandler(REGISTER_EMAIL_OR_PASSWORD_ERROR, ctx)

  const users = await userService.findUserByEmail(email)
  if (users.length) {
    return errorHandler(EMAIL_IS_ALREADY_EXISTS, ctx)
  }

  await next()
}

const verifyEmailLogin = async (ctx, next) => {
  try {
    const { email, password } = ctx.request.body
    // 1. verify email and password
    if (!email || !password) return errorHandler(EMAIL_OR_PASSWORD_ERROR, ctx)
    // 2. consider the situation that user does not exist
    let users = null

    if (email === 'test1') users = await userService.findUserByEmail('test1@gmail.com')
    else users = await userService.findUserByEmail(email)

    if (!users.length) return errorHandler(EMAIL_OR_PASSWORD_ERROR, ctx)
    const user = users[0]

    // 3. consider the situation that password is not correct
    const hashedPassword = user.password
    const isValidPassword = userService.passwordCompare(password, hashedPassword)
    if (!isValidPassword) return errorHandler(EMAIL_OR_PASSWORD_ERROR, ctx)

    ctx.user = user

    await next()
  } catch (err) {
    console.log('catch error', err)
    errorHandler(EMAIL_OR_PASSWORD_ERROR, ctx)
  }
}

module.exports = {
  verifyUser,
  verifyEmailLogin,
  validateUserInfo,
  upload
}
