const { google } = require('googleapis')
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('../config/secret')

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
)

const scopes = ['https://www.googleapis.com/auth/userinfo.email']

const getAuthorizationUrl = async (ctx, next) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true
  })

  ctx.authorizationUrl = authorizationUrl
  await next()
}

const checkUserEmail = async (ctx, next) => {
  const { code } = ctx.request.body

  if (!code) {
    ctx.body = {
      success: false,
      message: 'code is required'
    }

    return
  }

  try {
    // 拿 code（授權碼）取得 token
    let { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // 使用 OAuth2 client 取得 user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    let userInfo = await oauth2.userinfo.get()

    // 準備儲存的資料
    const userEmail = userInfo.data.email
    ctx.userEmail = userEmail
    await next()
  } catch (err) {
    console.log('googleLogin error', err)
    ctx.body = {
      success: false,
      message: err
    }
  }
}

module.exports = {
  checkUserEmail,
  getAuthorizationUrl
}
