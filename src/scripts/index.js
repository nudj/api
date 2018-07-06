require('envkey')
const { Database } = require('arangojs')
const knex = require('knex')
const { OLD_DB_URL, NO_SQL_URL } = require('../lib/constants')

const db = new Database({ url: OLD_DB_URL })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const [ scriptName, target, arg ] = process.argv.slice(2, 5)

let prefix = ''
if (['test', 'staging', 'development'].includes(target)) {
  prefix = `${target.toUpperCase()}_`
}

const sql = knex({
  client: 'mysql',
  connection: {
    host: process.env[`${prefix}SQL_HOST`],
    port: process.env[`${prefix}SQL_PORT`],
    user: process.env[`${prefix}SQL_USER`],
    password: process.env[`${prefix}SQL_PASS`],
    database: process.env[`${prefix}SQL_NAME`],
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
    await script({ db, sql, nosql, arg })
  } catch (error) {
    console.log('\n\n', error)
    exitCode = 1
  } finally {
    await sql.destroy()
    process.exit(exitCode)
  }
})()
