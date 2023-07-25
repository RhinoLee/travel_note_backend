const { connectionPool } = require('./app/database')
const migration = require('mysql-migrations')

migration.init(
  connectionPool,
  __dirname + '/migrations',
  () => {
    console.log('finished running migrations')
  },
  ['--update-schema']
)
