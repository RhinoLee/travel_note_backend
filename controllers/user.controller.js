const userService = require('../services/user.service')
const { PRIVATE_KEY } = require('../config/secret')
const jwt = require('jsonwebtoken')

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
    // 2. generate token
    const token = jwt.sign({ id, name }, PRIVATE_KEY, {
      expiresIn: 60 * 60 * 24,
      algorithm: 'RS256'
    })

    ctx.body = { success: true, data: { id, name, token } }
  }
}

module.exports = new UserController()
