require('envkey')
const { Database } = require('arangojs')

const { DB_URL } = require('../../../gql/lib/constants')

process.env.DB_NAME = 'test'

const db = new Database({ url: DB_URL })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

module.exports = db
