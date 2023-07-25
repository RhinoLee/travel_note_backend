const mysql2 = require('mysql2/promise')
const { MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST } = require('../config/server')

const pool = mysql2.createPool({
  host: MYSQL_HOST,
  port: 3306,
  database: MYSQL_DATABASE,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  connectionLimit: 10
})

module.exports = { pool }
