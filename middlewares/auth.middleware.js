const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../config/secret')

const verifyToken = async (ctx, next) => {
  const authHeader = ctx.request.header.authorization
  if (authHeader) {
    const token = authHeader.split(' ')[1]
    try {
      const decoded = jwt.verify(token, PRIVATE_KEY)
      const { id: userId } = decoded
      ctx.userId = userId
    } catch (err) {
      console.log('verify token error', err)
      ctx.status = 403
      ctx.body = 'Invalid Token'
      return
    }
  } else {
    ctx.status = 401
    ctx.body = 'No token provided'
    return
  }

  await next()
}

module.exports = { verifyToken }
