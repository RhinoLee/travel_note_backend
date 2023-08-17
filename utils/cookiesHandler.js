const Tokens = require('csrf')
const tokens = new Tokens()
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../config/secret')
const { ACCESS_TOKEN, REFRESH_TOKEN, CSRF_TOKEN } = require('../config/constants/tokenConstants')

function generateToken({ id, name }) {
  // 正式
  // const accessTokenExp = 60 * 60 * 24
  // const refreshTokenExp = 60 * 60 * 24 * 7

  // for test
  const accessTokenExp = '1h'
  const refreshTokenExp = 60 * 60 * 24 * 7

  const accessToken = jwt.sign({ id, name }, PRIVATE_KEY, {
    expiresIn: accessTokenExp,
    algorithm: 'RS256'
  })
  const refreshToken = jwt.sign({ id, name }, PRIVATE_KEY, {
    expiresIn: refreshTokenExp,
    algorithm: 'RS256'
  })

  const csrfToken = tokens.create(accessToken)

  const accessCookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + accessTokenExp),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }

  const refreshCookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + refreshTokenExp),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }

  const csrfCookieOptions = {
    httpOnly: false,
    expires: new Date(Date.now() + refreshTokenExp),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }

  return {
    accessToken,
    refreshToken,
    csrfToken,
    accessCookieOptions,
    refreshCookieOptions,
    csrfCookieOptions
  }
}

function setAuthCookies(ctx, id, name) {
  const {
    accessToken,
    refreshToken,
    csrfToken,
    jwtCookieOptions,
    refreshCookieOptions,
    csrfCookieOptions
  } = generateToken({ id, name })

  ctx.cookies.set(ACCESS_TOKEN, accessToken, jwtCookieOptions)
  ctx.cookies.set(REFRESH_TOKEN, refreshToken, refreshCookieOptions)
  ctx.cookies.set(CSRF_TOKEN, csrfToken, csrfCookieOptions)

  return { accessToken, refreshToken, csrfToken }
}

function clearAuthCookies(ctx) {
  ctx.cookies.set(ACCESS_TOKEN, null, { maxAge: 0 })
  ctx.cookies.set(REFRESH_TOKEN, null, { maxAge: 0 })
  ctx.cookies.set(CSRF_TOKEN, null, { maxAge: 0 })
}

module.exports = { setAuthCookies, clearAuthCookies }
