require('envkey')
const { Database } = require('arangojs')
const knex = require('knex')

const db = new Database({ url: `http://${process.env.DB_HOST}:${process.env.DB_PORT}` })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const nosql = new Database({ url: `http://${process.env.NO_SQL_HOST}:${process.env.NO_SQL_PORT}` })
nosql.useDatabase(process.env.NO_SQL_NAME)
nosql.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

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

const [scriptName] = process.argv.slice(2)
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
