const knex = require('knex')
const { Database } = require('arangojs')

const { NO_SQL_URL, OLD_DB_URL } = require('./constants')

const sql = knex({
  client: 'mysql',
  connection: {
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_NAME,
    charset: 'utf8mb4'
  }
})

const nosql = new Database({ url: NO_SQL_URL })
nosql.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)
if (process.env.TARGET === 'test') {
  nosql.useDatabase(`test-nosql`)
} else {
  nosql.useDatabase(process.env.NO_SQL_NAME)
}

const oldDb = new Database({ url: OLD_DB_URL })
oldDb.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)
oldDb.useDatabase(process.env.DB_NAME)

module.exports = {
  sql,
  nosql,
  oldDb
}
