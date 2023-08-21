const Tokens = require('csrf')
const tokens = new Tokens()
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../config/secret')
const { ACCESS_TOKEN, REFRESH_TOKEN, CSRF_TOKEN } = require('../config/constants/tokenConstants')

function generateToken({ id, name }) {
  console.log('generateToken')
  // 正式
  // const accessTokenExp = 60 * 60 * 24
  // const refreshTokenExp = 60 * 60 * 24 * 7

  // for test
  const accessTokenExp = 5 * 60 // 5 mins for test
  const accessTokenCookieExp = 60 * 60 * 24 * 7 * 1000
  const refreshTokenExp = 60 * 60 * 24 * 7
  const refreshCookieTokenExp = refreshTokenExp * 1000

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
    expires: new Date(Date.now() + accessTokenCookieExp),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }

  const refreshCookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + refreshCookieTokenExp),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }

  const csrfCookieOptions = {
    httpOnly: false,
    expires: new Date(Date.now() + accessTokenCookieExp),
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
    accessCookieOptions,
    refreshCookieOptions,
    csrfCookieOptions
  } = generateToken({ id, name })

  ctx.cookies.set(ACCESS_TOKEN, accessToken, accessCookieOptions)
  ctx.cookies.set(REFRESH_TOKEN, refreshToken, refreshCookieOptions)
  ctx.cookies.set(CSRF_TOKEN, csrfToken, csrfCookieOptions)

  return { accessToken, refreshToken, csrfToken }
}

function clearAuthCookies(ctx) {
  console.log('clearAuthCookies')
  ctx.cookies.set(ACCESS_TOKEN, null, { maxAge: 0 })
  ctx.cookies.set(REFRESH_TOKEN, null, { maxAge: 0 })
  ctx.cookies.set(CSRF_TOKEN, null, { maxAge: 0 })
}

module.exports = { setAuthCookies, clearAuthCookies }
