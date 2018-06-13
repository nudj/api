require('envkey')
const { Database } = require('arangojs')
const { DB_URL, NO_SQL_URL } = require('../gql/lib/constants')

const db = new Database({ url: DB_URL })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const nosql = new Database({ url: NO_SQL_URL })
nosql.useDatabase(process.env.NO_SQL_NAME)
nosql.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

const [ scriptName, arg ] = process.argv.slice(2, 4)

const script = require(`./${scriptName}`);

(async () => {
  try {
    await script({ db, nosql, arg })
  } catch (error) {
    console.log('\n\n', error)
  }
})()
