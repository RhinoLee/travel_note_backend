const dotenv = require('dotenv')

dotenv.config()

module.exports = { SERVER_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST } =
  process.env
