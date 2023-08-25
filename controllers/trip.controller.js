const tripService = require('../services/trip.service')
const { uploadImageToGCP, deleteImageFromGCP } = require('../utils/imageHandler')
const errorHandler = require('../utils/errorHandlers/tripsErrorHandler')
const {
  CREATE_TRIP_ERROR,
  GET_TRIPS_ERROR,
  GET_TRIP_ERROR,
  CREATE_TRIP_DAY_ERROR,
  GET_TRIP_DESTINATION_ERROR,
  UPDATE_TRIP_DESTINATION_ERROR,
  DELETE_TRIP_DESTINATION_ERROR
} = require('../config/constants/errorConstants/tripsErrorConstants')

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

      errorHandler(CREATE_TRIP_ERROR, ctx)
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
      errorHandler(GET_TRIPS_ERROR, ctx)
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
      errorHandler(GET_TRIP_ERROR, ctx)
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
    const { userId } = ctx

    try {
      await tripService.createTripDayWithDestination({
        userId,
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
      errorHandler(CREATE_TRIP_DAY_ERROR, ctx)
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
      errorHandler(GET_TRIP_DESTINATION_ERROR, ctx)
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
      errorHandler(UPDATE_TRIP_DESTINATION_ERROR, ctx)
    }
  }
  async deleteDestination(ctx) {
    const { destination_id } = ctx.request.body

    try {
      await tripService.deleteDestination(destination_id)

      ctx.body = {
        success: true,
        data: {}
      }
    } catch (err) {
      errorHandler(DELETE_TRIP_DESTINATION_ERROR, ctx)
    }
  }
}

module.exports = new tripController()
