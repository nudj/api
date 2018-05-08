require('envkey')
const knex = require('knex')

const sql = knex({
  client: 'mysql',
  connection: {
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    user: 'nudjtest',
    password: 'nudjtestpass',
    database: 'test'
  }
})

module.exports = sql
