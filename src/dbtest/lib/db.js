const { Database } = require('arangojs')

const db = new Database({
  url: 'http://db:8529'
})

db.useDatabase('test')
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

module.exports = db
