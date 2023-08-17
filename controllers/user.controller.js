const userService = require('../services/user.service')
const { setAuthCookies } = require('../utils/cookiesHandler')

class UserController {
  async create(ctx) {
    const user = ctx.request.body

    try {
      const res = await userService.create(user)
      ctx.status = 201
      ctx.body = { success: true, ...res }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        message: error
      }
    }
  }

  async login(ctx) {
    // 1. get user data
    const { id, name } = ctx.user
    // 2. generate token & set cookies
    const { refreshToken: newRefreshToken } = setAuthCookies(ctx, id, name)

    // 更新資料庫 refresh token
    await userService.updateRefreshToken(id, newRefreshToken)

    ctx.body = { success: true, data: { id, name } }
  }
}

module.exports = new UserController()
