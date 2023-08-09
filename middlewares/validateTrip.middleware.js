const multer = require('@koa/multer')
const { object, date, string, ref } = require('yup')
const createValidationMiddleware = require('../utils/createValidationMiddleware')

const imageRegex = /^image\/(jpe?g|png|gif|webp)$/i
const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 20 // 20MB
  },
  fileFilter: (req, file, cb) => {
    console.log('file xxx', file)
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
  tripImage: string().nullable(),
  title: string().required(),
  start_date: date().required(),
  end_date: date().required().min(ref('start_date'))
})

const validateTrip = createValidationMiddleware(tripSchema)

module.exports = { validateTrip, upload }
