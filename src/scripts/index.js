require('envkey')
const { Database } = require('arangojs')
const knex = require('knex')
const { OLD_DB_URL, NO_SQL_URL } = require('../lib/constants')

const db = new Database({ url: OLD_DB_URL })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const [ scriptName, target ] = process.argv.slice(2, 4)

const host = target ? process.env[`${target.toUpperCase()}_SQL_HOST`] : process.env.SQL_HOST
const port = target ? process.env[`${target.toUpperCase()}_SQL_PORT`] : process.env.SQL_PORT
const user = target ? process.env[`${target.toUpperCase()}_SQL_USER`] : process.env.SQL_USER
const password = target ? process.env[`${target.toUpperCase()}_SQL_PASS`] : process.env.SQL_PASS
const database = target ? process.env[`${target.toUpperCase()}_SQL_NAME`] : process.env.SQL_NAME

const sql = knex({
  client: 'mysql',
  connection: {
    host,
    port,
    user,
    password,
    database,
    charset: 'utf8mb4'
  }
})

const nosql = new Database({ url: NO_SQL_URL })
nosql.useDatabase(process.env.NO_SQL_NAME)
nosql.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

const script = require(`./${scriptName}`);

(async () => {
  let exitCode = 0
  try {
    await script({ db, sql, nosql })
  } catch (error) {
    console.log('\n\n', error)
    exitCode = 1
  } finally {
    await sql.destroy()
    process.exit(exitCode)
  }
})()
