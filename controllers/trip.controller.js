const tripService = require('../services/trip.service')
const { uploadImageToGCP, deleteImageFromGCP } = require('../utils/imageHandler')

class tripController {
  async create(ctx) {
    const { title, startDate, endDate } = ctx.request.body
    const file = ctx.request.file
    const { userId } = ctx
    // 待回傳的圖片網址（上傳 cloud storage 成功）
    let imageUrl = null
    // user 有上傳圖片
    try {
      if (file) imageUrl = await uploadImageToGCP({ file, userId })

      const trip = await tripService.create({ userId, title, startDate, endDate, imageUrl })

      ctx.body = {
        success: true,
        data: trip
      }
    } catch (err) {
      console.log('image upload err', err)

      // 建立資料失敗，刪除上傳的圖片
      if (imageUrl) {
        await deleteImageFromGCP(imageUrl)
      }

      ctx.body = {
        success: false,
        message: 'create trip failed'
      }
      return
    }
  }
  async list(ctx) {
    const { limit, page } = ctx.query
    const { userId } = ctx
    try {
      const offset = (page - 1) * limit
      const { data, pagination } = await tripService.getList({ userId, limit, offset })
      const totalPages = Math.ceil(pagination.totalSize / pagination.limit)
      pagination.totalPages = totalPages
      pagination.page = Number(page)
      ctx.body = {
        success: true,
        data,
        pagination
      }
    } catch (err) {
      ctx.body = {
        success: false,
        message: 'get trips failed'
      }
    }
  }
}

module.exports = new tripController()
