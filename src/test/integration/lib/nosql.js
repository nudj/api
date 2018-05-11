require('envkey')
const { Database } = require('arangojs')

process.env.NO_SQL_NAME = 'test-nosql'

const nosql = new Database({ url: `http://${process.env.NO_SQL_HOST}:${process.env.NO_SQL_PORT}` })
nosql.useDatabase(process.env.NO_SQL_NAME)
nosql.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

module.exports = nosql
