require('envkey')
const { Database } = require('arangojs')

const { DB_URL, NO_SQL_URL } = require('../gql/lib/constants')

const db = new Database({ url: DB_URL })
const [migrationName, direction] = process.argv.slice(2)

db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const noSQL = new Database({ url: NO_SQL_URL })
noSQL.useDatabase(process.env.NO_SQL_NAME)
noSQL.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

const migration = require(`./${migrationName}`)

async function step (description, actions) {
  process.stdout.write(description)
  await actions()
  process.stdout.write(' 👍\n')
}

(async () => {
  try {
    await migration[direction]({ db, noSQL, step })
  } catch (error) {
    console.log('\n\n', error)
  }
})()
