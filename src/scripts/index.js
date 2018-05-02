require('envkey')
const { Database } = require('arangojs')
const knex = require('knex')
const { OLD_DB_URL, NO_SQL_URL } = require('../lib/constants')

const db = new Database({ url: OLD_DB_URL })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

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
nosql.useDatabase(process.env.NO_SQL_NAME)
nosql.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

const [ scriptName, arg ] = process.argv.slice(2, 4)
const script = require(`./${scriptName}`);

(async () => {
  let exitCode = 0
  try {
    await script({ db, sql, nosql, arg })
  } catch (error) {
    console.log('\n\n', error)
    exitCode = 1
  } finally {
    await sql.destroy()
    process.exit(exitCode)
  }
})()
