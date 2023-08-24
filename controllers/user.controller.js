const userService = require('../services/user.service')
const { setAuthCookies, clearAuthCookies } = require('../utils/cookiesHandler')
const { PROVIDER_GOOGLE, PROVIDER_EMAIL } = require('../config/constants/providerConstants')
const errorHandler = require('../utils/errorHandlers/userErrorHandler')
const { uploadImageToGCP, deleteImageFromGCP } = require('../utils/imageHandler')
const {
  EMAIL_REGISTER_ERROR,
  LOGIN_ERROR,
  GET_USER_ERROR,
  UPDATE_USER_ERROR
} = require('../config/constants/errorConstants/userErrorConstants')

class UserController {
  getUserInfo = async (ctx) => {
    try {
      const usersResult = await userService.findUserById(ctx.userId)
      const user = usersResult[0]
      const { id, name, avatar, email } = user

      ctx.body = {
        success: true,
        data: { id, name, avatar, email }
      }
    } catch (err) {
      errorHandler(GET_USER_ERROR, ctx)
    }
  }
  updateUserInfo = async (ctx) => {
    const { name, avatar } = ctx.request.body
    const file = ctx.request.file
    const { userId } = ctx
    // 待回傳的圖片網址（上傳 cloud storage 成功）
    let imageUrl = null
    try {
      let oldImageUrl = null

      // user 有上傳新圖片
      if (file) {
        imageUrl = await uploadImageToGCP({ file, userId, folderName: 'avatar' })
        // 先找出舊的 imageUrl，上傳新圖成功後刪除
        oldImageUrl = await userService.findUserAvatar(userId)
      } else if (typeof avatar === 'string') {
        // user 帶舊圖，不更換
        imageUrl = avatar
      }

      // 如果兩個都沒帶，代表要刪除圖片
      if (!file && !avatar) oldImageUrl = await userService.findUserAvatar(userId)

      // 更新資料庫
      await userService.update({
        id: ctx.userId,
        name,
        avatar: imageUrl ?? null
      })

      // 刪除舊頭貼
      if (oldImageUrl) await deleteImageFromGCP(oldImageUrl)

      // 回傳 user info
      await this.getUserInfo(ctx)
    } catch (err) {
      console.log('updateUserInfo', err)
      // 建立資料失敗，刪除上傳的圖片
      if (imageUrl) {
        await deleteImageFromGCP(imageUrl)
      }
      errorHandler(UPDATE_USER_ERROR, ctx)
    }
  }
  // email 註冊
  create = async (ctx) => {
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
  login = async (ctx) => {
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

  // 登出
  logout = async (ctx) => {
    try {
      const { userId } = ctx
      await userService.updateRefreshToken(userId, null)
      // 清除 cookies
      clearAuthCookies(ctx)

      ctx.body = { success: true, data: {} }
    } catch (err) {
      console.log('logout error', err)
    }
  }

  // google 第三方登入
  googleLoginUrl = async (ctx) => {
    const authorizationUrl = ctx.authorizationUrl

    if (!authorizationUrl) {
      errorHandler(LOGIN_ERROR, ctx)
      return
    }

    ctx.body = { success: true, data: { login_url: authorizationUrl } }
  }

  googleLogin = async (ctx) => {
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
