const multer = require('@koa/multer')
const { object, date, string, ref } = require('yup')
const createValidationMiddleware = require('../utils/createValidationMiddleware')

const imageRegex = /^image\/(jpe?g|png|gif|webp)$/i
const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 20 // 20MB
  },
  fileFilter: (req, file, cb) => {
    console.log('file', file)
    if (!file) return cb(null, true)
    if (imageRegex.test(file.mimetype.toLowerCase())) {
      return cb(null, true)
    } else {
      // 錯誤會透過全域 multerErrorHandler.middleware 處理
      return cb(null, false, new Error('Only image files are allowed!'))
    }
  }
})

const tripSchema = object({
  trip_image: string().nullable(),
  title: string().required(),
  startDate: date().required(),
  endDate: date().required().min(ref('startDate'))
})

const validateTrip = createValidationMiddleware(tripSchema)

module.exports = { validateTrip, upload }
