const tripService = require('../services/trip.service')
const { uploadImageToGCP, deleteImageFromGCP } = require('../utils/imageHandler')

class tripController {
  async create(ctx) {
    const { title, start_date, end_date } = ctx.request.body
    const file = ctx.request.file
    const { userId } = ctx
    // 待回傳的圖片網址（上傳 cloud storage 成功）
    let imageUrl = null
    // user 有上傳圖片
    try {
      if (file) imageUrl = await uploadImageToGCP({ file, userId, folderName: 'trips' })

      const trip = await tripService.create({ userId, title, start_date, end_date, imageUrl })

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
  async trip(ctx) {
    const { trip_id } = ctx.query
    const { userId } = ctx

    try {
      const { data } = await tripService.getTrip({ userId, trip_id })

      ctx.body = {
        success: true,
        data
      }
    } catch (err) {
      ctx.body = {
        success: false,
        message: 'get trip failed'
      }
    }
  }
  async createTripDayWithDestination(ctx) {
    const {
      trip_id,
      trip_date,
      name,
      address,
      place_id,
      lat,
      lng,
      arrival_time,
      leave_time,
      visit_order
    } = ctx.request.body

    try {
      const result = await tripService.createTripDayWithDestination({
        trip_id,
        trip_date,
        name,
        address,
        place_id,
        lat,
        lng,
        arrival_time,
        leave_time,
        visit_order
      })

      ctx.body = {
        success: true
      }
    } catch (err) {
      console.log('createTripDayWithDestination db error', err)
      ctx.body = {
        success: false,
        message: 'create trip day failed'
      }
    }
  }
  async getTripDayWithDestination(ctx) {
    const { userId } = ctx
    const { trip_id, trip_date } = ctx.params

    try {
      const data = await tripService.getTripDayWithDestination({ userId, trip_id, trip_date })
      ctx.body = {
        success: true,
        data
      }
    } catch (err) {
      console.log('getTripDayWithDestination error', err)
      ctx.body = {
        success: false,
        message: 'get tripday with destination failed'
      }
    }
  }
  async updateTripDayWithDestination(ctx) {
    /**
     * @id - tripdays_destinations table id
     * @trip_id - trips table id
     * @destination_id - destination table id
     */
    const { trip_id, id } = ctx.params
    const { arrival_time, leave_time, name, trip_date } = ctx.request.body
    const { userId } = ctx

    try {
      const data = await tripService.updateTripDayWithDestination({
        trip_id,
        id,
        arrival_time,
        leave_time,
        name,
        trip_date,
        userId
      })

      ctx.body = {
        success: true,
        data
      }
    } catch (err) {
      console.log('updateTripDayWithDestination db error', err)
      ctx.body = {
        success: false,
        message: 'update trip day failed'
      }
    }
  }
}

module.exports = new tripController()
