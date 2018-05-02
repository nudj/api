require('envkey')
const { Database } = require('arangojs')

const { OLD_DB_URL } = require('../../../lib/constants')

process.env.DB_NAME = 'test'

const db = new Database({ url: OLD_DB_URL })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

module.exports = db
