require('envkey')
const { Database } = require('arangojs')

const { NO_SQL_URL } = require('../../../lib/constants')

process.env.NO_SQL_NAME = 'test-nosql'

const nosql = new Database({ url: NO_SQL_URL })
nosql.useDatabase(process.env.NO_SQL_NAME)
nosql.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

module.exports = nosql
