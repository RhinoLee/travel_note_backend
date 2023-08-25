const {
  CREATE_TRIP_ERROR,
  GET_TRIPS_ERROR,
  GET_TRIP_ERROR,
  CREATE_TRIP_DAY_ERROR,
  GET_TRIP_DESTINATION_ERROR,
  UPDATE_TRIP_DESTINATION_ERROR,
  DELETE_TRIP_DESTINATION_ERROR
} = require('../../config/constants/errorConstants/tripsErrorConstants')

function errorHandler(err, ctx) {
  let status = 400
  let message = ''

  switch (err) {
    case CREATE_TRIP_ERROR:
      status = 500
      message = 'CREATE_TRIP_ERROR'
      break
    case GET_TRIPS_ERROR:
      status = 500
      message = 'GET_TRIPS_ERROR'
      break
    case GET_TRIP_ERROR:
      status = 500
      message = 'GET_TRIP_ERROR'
      break
    case CREATE_TRIP_DAY_ERROR:
      status = 500
      message = 'CREATE_TRIP_DAY_ERROR'
      break
    case GET_TRIP_DESTINATION_ERROR:
      status = 500
      message = 'GET_TRIP_DESTINATION_ERROR'
      break
    case UPDATE_TRIP_DESTINATION_ERROR:
      status = 500
      message = 'UPDATE_TRIP_DESTINATION_ERROR'
      break
    case DELETE_TRIP_DESTINATION_ERROR:
      status = 500
      message = 'DELETE_TRIP_DESTINATION_ERROR'
      break
  }

  ctx.status = status
  ctx.body = { success: false, message }
}

module.exports = errorHandler
