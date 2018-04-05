require('envkey')
const { Database } = require('arangojs')

const { DB_URL: url } = require('../../../gql/lib/constants')

process.env.DB_NAME = 'test'

const db = new Database({ url })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

module.exports = db
