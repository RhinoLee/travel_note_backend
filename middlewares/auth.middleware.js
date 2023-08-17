const Tokens = require('csrf')
const tokens = new Tokens()
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../config/secret')
const { ACCESS_TOKEN, REFRESH_TOKEN } = require('../config/constants/tokenConstants')
const userService = require('../services/user.service')
const { setAuthCookies, clearAuthCookies } = require('../utils/cookiesHandler')

const verifyToken = async (ctx, next) => {
  const csrfToken = ctx.request.header['x-csrf-token']
  const accessToken = ctx.cookies.get(ACCESS_TOKEN)
  const refreshToken = ctx.cookies.get(REFRESH_TOKEN)

  if (accessToken && csrfToken) {
    try {
      // 驗證 CSRF Token
      if (!tokens.verify(accessToken, csrfToken)) throw new Error('invalid csrf token')

      // 驗證 JWT token
      const decoded = jwt.verify(accessToken, PRIVATE_KEY)

      const { id: userId } = decoded
      ctx.userId = userId
    } catch (err) {
      // jwt 過期，拿 refresh token 來更新 access token
      if (err instanceof jwt.TokenExpiredError && refreshToken) {
        console.log('access token expired')
        // 在此處檢查和處理 refreshToken
        try {
          // 驗證 refreshToken
          const decodedRefresh = jwt.verify(refreshToken, PRIVATE_KEY)

          // 檢查 refreshToken 是否在 DB 中
          const users = await userService.findUserById(decodedRefresh.id)
          const refreshTokenHash = users[0]['refresh_token']
          // 驗證 refreshToken
          const isRefreshTokenMatch = userService.refreshTokenCompare(
            refreshToken,
            refreshTokenHash
          )
          if (!isRefreshTokenMatch) throw new Error('Invalid refresh token')

          // 如果 refreshToken 有效，建立新的 accessToken, refreshToken, csrfToken cookies
          const { refreshToken: newRefreshToken } = setAuthCookies(
            ctx,
            decodedRefresh.id,
            decodedRefresh.name
          )

          // 更新資料庫 refresh token
          await userService.updateRefreshToken(decodedRefresh.id, newRefreshToken)

          ctx.userId = decodedRefresh.id
        } catch (refreshErr) {
          // refresh token 過期或驗證失敗
          console.log('refresh token error', refreshErr)
          // 清除 cookies
          clearAuthCookies(ctx)

          ctx.status = 401
          ctx.body = 'Invalid refresh token'
          return
        }
      } else {
        console.log('other err', err)
        ctx.status = 401
        ctx.body = err
        return
      }
    }
  } else {
    ctx.status = 401
    ctx.body = 'No token provided'
    return
  }

  await next()
}

module.exports = { verifyToken }
