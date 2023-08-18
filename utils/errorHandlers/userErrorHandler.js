const {
  REGISTER_NAME_ERROR,
  EMAIL_OR_PASSWORD_ERROR,
  EMAIL_IS_ALREADY_EXISTS,
  EMAIL_REGISTER_ERROR,
  LOGIN_ERROR
} = require('../../config/constants/errorConstants/userErrorConstants')

function errorHandler(err, ctx) {
  let status = 400
  let message = ''

  switch (err) {
    case REGISTER_NAME_ERROR:
      status = 400
      message = 'name is not valid'
      break
    case EMAIL_OR_PASSWORD_ERROR:
      status = 400
      message = 'email or password is not valid'
      break
    case EMAIL_IS_ALREADY_EXISTS:
      status = 400
      message = 'email is already exists'
      break
    case EMAIL_REGISTER_ERROR:
      status = 500
      message = EMAIL_REGISTER_ERROR
      break
    case LOGIN_ERROR:
      status = 500
      message = LOGIN_ERROR
      break
  }

  ctx.status = status
  ctx.body = { success: false, message }
}

module.exports = errorHandler
