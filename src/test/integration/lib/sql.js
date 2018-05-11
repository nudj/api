require('envkey')
const knex = require('knex')

const sql = knex({
  client: 'mysql',
  connection: {
    host: process.env.TEST_SQL_HOST,
    port: process.env.TEST_SQL_PORT,
    user: process.env.TEST_SQL_USER,
    password: process.env.TEST_SQL_PASS,
    database: process.env.TEST_SQL_NAME
  }
})

module.exports = sql
