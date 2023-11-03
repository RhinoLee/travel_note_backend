const fs = require('fs')
const path = require('path')
const util = require('util')
const errorHandler = require('../utils/errorHandlers/tripsErrorHandler')
const {
  GET_TRIP_DESTINATION_ERROR
} = require('../config/constants/errorConstants/tripsErrorConstants')

const readFileAsync = util.promisify(fs.readFile)
const filePath = path.join(__dirname, '../files/coordinates.json')

class testController {
  async getBigData(ctx) {
    try {
      const data = await readFileAsync(filePath, 'utf8')

      ctx.body = {
        success: true,
        data: JSON.parse(data)
      }
    } catch (err) {
      console.log('getBigData error: ', err)
      return errorHandler(GET_TRIP_DESTINATION_ERROR, ctx)
    }
  }
}

module.exports = new testController()
