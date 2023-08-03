// handler multer throw error
const multer = require('multer')

function multerErrorHandler(app) {
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      if (err instanceof multer.MulterError) {
        ctx.status = 400
        ctx.body = {
          success: false,
          message: err.message
        }
      } else {
        ctx.status = 500
      }
    }
  })
}

module.exports = multerErrorHandler
