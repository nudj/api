require('envkey')
const { Database } = require('arangojs')

const { DB_URL, NO_SQL_URL } = require('../../../gql/lib/constants')

process.env.DB_NAME = 'test'
process.env.NO_SQL_NAME = 'test-nosql'

const db = new Database({ url: DB_URL })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const nosql = new Database({ url: NO_SQL_URL })
nosql.useDatabase(process.env.NO_SQL_NAME)
nosql.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

module.exports = { db, nosql }
