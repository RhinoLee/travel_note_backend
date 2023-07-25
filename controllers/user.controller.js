const userService = require('../services/user.service')

class UserController {
  async create(ctx) {
    const user = ctx.request.body

    try {
      const res = await userService.create(user)
      ctx.status = 201
      ctx.body = { ...res }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        message: error
      }
    }
  }
}

module.exports = new UserController()
