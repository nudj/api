require('envkey')
const { Database } = require('arangojs')
const knex = require('knex')

const db = new Database({
  url: 'http://db:8529'
})
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const sql = knex({
  client: 'mysql',
  connection: {
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_NAME
  }
})

const [scriptName] = process.argv.slice(2)
const script = require(`./${scriptName}`);

(async () => {
  try {
    await script({ db, sql })
  } catch (error) {
    console.log('\n\n', error)
  }
})()
