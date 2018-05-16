const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')
const knex = require('knex')
const { Database } = require('arangojs')

const schema = require('./schema')
const { DB_URL: url } = require('./lib/constants')

const sql = knex({
  client: 'mysql',
  connection: {
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_NAME,
    charset: 'utf8mb4'
  }
})

const nosql = new Database({ url })
nosql.useDatabase(process.env.NO_SQL_NAME)
nosql.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

module.exports = ({ transaction, sqlStore, nosqlStore }) => {
  const app = express()
  app.use(
    '/',
    bodyParser.json({
      limit: '5mb'
    }),
    graphqlExpress(req => {
      const context = {
        userId: req.body.userId,
        transaction,
        sql: sqlStore({
          db: sql
        }),
        nosql: nosqlStore({
          db: nosql
        })
      }
      return {
        schema,
        context
      }
    })
  )
  return app
}
