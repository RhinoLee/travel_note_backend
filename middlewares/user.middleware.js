const {
  REGISTER_PROVIDER_ERROR,
  REGISTER_NAME_ERROR,
  REGISTER_EMAIL_OR_PASSWORD_ERROR,
  EMAIL_IS_ALREADY_EXISTS
} = require('../config/constants/errorConstants')
const providerConstants = require('../config/constants/providerConstants')
const { passwordRegex } = require('../config/patterns')
const userService = require('../services/user.service')
const emailValidator = require('email-validator')

const verifyUser = async (ctx, next) => {
  const { name, password, email, provider, provider_id } = ctx.request.body

  if (!name) return ctx.app.emit('error', REGISTER_NAME_ERROR, ctx)

  // 判斷 provider => email 註冊 or 其他第三方註冊(ex: google)
  if (!provider || !Object.values(providerConstants).includes(provider)) {
    return ctx.app.emit('error', REGISTER_PROVIDER_ERROR, ctx)
  }

  // email 註冊
  if (provider === providerConstants.PROVIDER_EMAIL) {
    if (!password || !email) return ctx.app.emit('error', REGISTER_EMAIL_OR_PASSWORD_ERROR, ctx)

    if (!emailValidator.validate(email))
      return ctx.app.emit('error', REGISTER_EMAIL_OR_PASSWORD_ERROR, ctx)

    if (!passwordRegex.test(password))
      return ctx.app.emit('error', REGISTER_EMAIL_OR_PASSWORD_ERROR, ctx)

    const users = await userService.findUserByEmail(email)
    if (users.length) {
      return ctx.app.emit('error', EMAIL_IS_ALREADY_EXISTS, ctx)
    }
  }

  await next()
}

module.exports = {
  verifyUser
}
