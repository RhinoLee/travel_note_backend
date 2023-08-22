const userService = require('../services/user.service')
const { setAuthCookies } = require('../utils/cookiesHandler')
const { PROVIDER_GOOGLE, PROVIDER_EMAIL } = require('../config/constants/providerConstants')
const errorHandler = require('../utils/errorHandlers/userErrorHandler')
const {
  EMAIL_REGISTER_ERROR,
  LOGIN_ERROR,
  GET_USER_ERROR
} = require('../config/constants/errorConstants/userErrorConstants')

class UserController {
  async getUserInfo() {
    try {
      const usersResult = await userService.findUserById(ctx.userId)
      const user = usersResult[0]
      const { id, name, avatar } = user

      ctx.body = {
        success: true,
        data: { id, name, avatar }
      }
    } catch (err) {
      errorHandler(GET_USER_ERROR, ctx)
    }
  }
  // email 註冊
  async create(ctx) {
    const user = ctx.request.body
    // 設定 provider 為 email
    user.provider = PROVIDER_EMAIL

    try {
      const res = await userService.create(user)
      ctx.body = { success: true, ...res }
    } catch (err) {
      errorHandler(EMAIL_REGISTER_ERROR, ctx)
    }
  }

  // email 登入
  async login(ctx) {
    // 1. get user data
    const { id, name } = ctx.user
    try {
      // 2. generate token & set cookies
      const { refreshToken: newRefreshToken } = setAuthCookies(ctx, id, name)
      // 更新資料庫 refresh token
      await userService.updateRefreshToken(id, newRefreshToken)
      ctx.body = { success: true, data: { id, name } }
    } catch (err) {
      errorHandler(LOGIN_ERROR, ctx)
    }
  }

  // google 第三方登入
  async googleLoginUrl(ctx) {
    const authorizationUrl = ctx.authorizationUrl

    if (!authorizationUrl) {
      errorHandler(LOGIN_ERROR, ctx)
      return
    }

    ctx.body = { success: true, data: { login_url: authorizationUrl } }
  }

  async googleLogin(ctx) {
    async function getUserByEmail() {
      const usersResult = await userService.findUserByEmail(ctx.userEmail)
      const user = usersResult[0]
      return user
    }

    try {
      // 拿到 email 代表通過驗證登入成功
      if (ctx.userEmail) {
        // 先拿 email 到資料庫查詢 user 是否存在
        const users = await userService.findUserByEmail(ctx.userEmail)

        // 不存在 -> 新增 user
        if (!users.length) {
          const userInfo = {
            name: ctx.userEmail,
            password: null,
            email: ctx.userEmail,
            provider: PROVIDER_GOOGLE,
            provider_id: null
          }
          await userService.create(userInfo)
        }

        const { id, name, email, avatar } = await getUserByEmail()

        // 返回對應 cookies
        const { refreshToken: newRefreshToken } = setAuthCookies(ctx, id, name)

        // 更新資料庫 refresh token
        await userService.updateRefreshToken(id, newRefreshToken)

        ctx.body = {
          success: true,
          data: { id, name, email, avatar }
          // data: { ...user }
        }
      } else {
        errorHandler(LOGIN_ERROR, ctx)
      }
    } catch (err) {
      console.log('googleLogin error', err)
      errorHandler(LOGIN_ERROR, ctx)

      return
    }
  }
}

module.exports = new UserController()
