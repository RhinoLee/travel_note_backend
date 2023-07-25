const { pool } = require('./app/database')
const migration = require('mysql-migrations')

migration.init(
  pool,
  __dirname + '/migrations',
  () => {
    console.log('finished running migrations')
  },
  ['--update-schema']
)
