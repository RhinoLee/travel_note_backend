const {
  REGISTER_PROVIDER_ERROR,
  REGISTER_NAME_ERROR,
  EMAIL_OR_PASSWORD_ERROR,
  EMAIL_IS_ALREADY_EXISTS
} = require('../config/constants/errorConstants')
const providerConstants = require('../config/constants/providerConstants')
const { passwordRegex } = require('../config/patterns')
const userService = require('../services/user.service')
const emailValidator = require('email-validator')
const errorHandler = require('../utils/errorHandler')

const verifyUser = async (ctx, next) => {
  const { name, password, email, provider, provider_id } = ctx.request.body

  if (!name) return errorHandler(REGISTER_NAME_ERROR, ctx)

  // 判斷 provider => email 註冊 or 其他第三方註冊(ex: google)
  if (!provider || !Object.values(providerConstants).includes(provider)) {
    return errorHandler(REGISTER_PROVIDER_ERROR, ctx)
  }

  // email 註冊
  if (provider === providerConstants.PROVIDER_EMAIL) {
    if (!password || !email) return errorHandler(REGISTER_EMAIL_OR_PASSWORD_ERROR, ctx)

    if (!emailValidator.validate(email)) return errorHandler(REGISTER_EMAIL_OR_PASSWORD_ERROR, ctx)

    if (!passwordRegex.test(password)) return errorHandler(REGISTER_EMAIL_OR_PASSWORD_ERROR, ctx)

    const users = await userService.findUserByEmail(email)
    if (users.length) {
      return errorHandler(EMAIL_IS_ALREADY_EXISTS, ctx)
    }
  }

  await next()
}

const verifyEmailLogin = async (ctx, next) => {
  try {
    const { email, password } = ctx.request.body
    // 1. verify email and password
    if (!email || !password) return errorHandler(EMAIL_OR_PASSWORD_ERROR, ctx)
    // 2. consider the situation that user does not exist
    const users = await userService.findUserByEmail(email)
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
  verifyEmailLogin
}
