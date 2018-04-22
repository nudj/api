require('envkey')
const { Database } = require('arangojs')
const db = new Database({
  url: 'http://db:8529'
})
const [scriptName] = process.argv.slice(2)

db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const script = require(`./${scriptName}`)

async function step (description, actions) {
  process.stdout.write(description)
  await actions()
  process.stdout.write(' 👍\n')
}

(async () => {
  try {
    await script({ db, step })
  } catch (error) {
    console.log('\n\n', error)
  }
})()
