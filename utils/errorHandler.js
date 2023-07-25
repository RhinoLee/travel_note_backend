const app = require('../app')
const {
  REGISTER_PROVIDER_ERROR,
  REGISTER_NAME_ERROR,
  REGISTER_EMAIL_OR_PASSWORD_ERROR,
  EMAIL_IS_ALREADY_EXISTS
} = require('../config/constants/errorConstants')

app.on('error', (err, ctx) => {
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
    case REGISTER_EMAIL_OR_PASSWORD_ERROR:
      status = 400
      message = 'email or password is not valid'
      break
    case EMAIL_IS_ALREADY_EXISTS:
      status = 400
      message = 'email is already exists'
      break
  }

  ctx.status = status
  ctx.body = {
    message
  }
})
