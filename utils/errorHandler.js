const {
  REGISTER_PROVIDER_ERROR,
  REGISTER_NAME_ERROR,
  EMAIL_OR_PASSWORD_ERROR,
  EMAIL_IS_ALREADY_EXISTS
} = require('../config/constants/errorConstants')

function errorHandler(err, ctx) {
  let status = 400
  let message = ''

  switch (err) {
    case REGISTER_PROVIDER_ERROR:
      status = 400
      message = 'provider is not valid'
      break
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
  }

  ctx.status = status
  ctx.body = { message }
}

module.exports = errorHandler
