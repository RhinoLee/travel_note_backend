const tripService = require('../services/trip.service')
const { uploadImageToGCP, deleteImageFromGCP } = require('../utils/imageHandler')
const errorHandler = require('../utils/errorHandlers/tripsErrorHandler')
const {
  CREATE_TRIP_ERROR,
  GET_TRIPS_ERROR,
  GET_TRIP_ERROR,
  DELETE_TRIP_ERROR,
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
  async deleteTrip(ctx) {
    const { trip_id } = ctx.params
    const { userId } = ctx

    try {
      // 先找出 trip image 並刪除 google cloud storage 圖檔
      const { data } = await tripService.getTrip({ userId, trip_id })
      if (data.image_url) {
        deleteImageFromGCP(data.image_url)
      }

      await tripService.deleteTrip(trip_id, userId)

      ctx.body = {
        success: true,
        data: {}
      }
    } catch (err) {
      errorHandler(DELETE_TRIP_ERROR, ctx)
    }
  }
  async createTripDayWithDestination(ctx) {
    // 將 request body 統一成 Array 格式
    if (!Array.isArray(ctx.request.body)) {
      ctx.request.body = [ctx.request.body]
    }

    const { userId } = ctx
    const { trip_id, trip_date } = ctx.request.body[0]

    const trip_day_id = await this.#createTripdayIfNotExisted({ trip_id, trip_date })
    if (trip_day_id === null) throw Error()

    const requestData = ctx.request.body.map((place) => ({
      ...place,
      userId,
      trip_day_id
    }))

    try {
      // 新增當日目的地
      const promises = requestData.map(async (place) => {
        return tripService.createTripDayWithDestination(place)
      })

      await Promise.all(promises)

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
     * @tripdays_destinations_id - tripdays_destinations table id
     * @trip_id - trips table id
     * @destination_id - destination table id
     */
    const { trip_id, tripdays_destinations_id } = ctx.params
    const { arrival_time, leave_time, name, trip_date } = ctx.request.body
    const { userId } = ctx

    try {
      const trip_day_id = await this.#createTripdayIfNotExisted({ trip_id, trip_date })
      if (trip_day_id === null) throw Error()

      const data = await tripService.updateTripDayWithDestination({
        trip_id,
        tripdays_destinations_id,
        arrival_time,
        leave_time,
        trip_date,
        userId,
        trip_day_id
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
    const { tripdays_destinations_id } = ctx.params

    try {
      await tripService.deleteDestination(tripdays_destinations_id)

      ctx.body = {
        success: true,
        data: {}
      }
    } catch (err) {
      console.log('deleteDestination error:', err)
      errorHandler(DELETE_TRIP_DESTINATION_ERROR, ctx)
    }
  }
  async deleteDestinationWithTripDayId(userId, trip_id, trip_date) {
    try {
      // 用 trip_id & date 找出 trip_day_id
      const data = await tripService.getTripDayWithDestination({ userId, trip_id, trip_date })
      if (data.length > 0) {
        await tripService.deleteDestinationWithTripDayId(data[0].trip_day_id)
      }
    } catch (err) {
      console.log('deleteDestinationWithTripDayId error:', err)
      throw err
    }
  }
  /**
   * @trip_id 整趟旅程 id
   * @trip_date 整趟旅程其中一天的日期
   * @description 先看資料庫是否有當日資料（trip_days table），沒有則新增一筆 trip_day
   *
   **/
  async #createTripdayIfNotExisted({ trip_id, trip_date }) {
    const results = await tripService.getTripDay({ trip_id, trip_date })
    let trip_day_id = null

    if (results.length === 0) {
      const data = await tripService.createTripDay({ trip_id, trip_date })
      trip_day_id = data.trip_day_id
    } else {
      trip_day_id = results[0].id
    }

    return trip_day_id
  }
}

module.exports = new tripController()
