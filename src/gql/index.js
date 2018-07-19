const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')
const { Database } = require('arangojs')

const schema = require('./schema')
const { DB_URL: url } = require('./lib/constants')
const setupDataLoaderCache = require('./lib/setup-dataloader-cache')
const formatError = require('./lib/format-error')
const healthcheck = require('./routers/health-check')

const db = new Database({ url })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const nosql = new Database({ url })
nosql.useDatabase(process.env.NO_SQL_NAME)
nosql.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

module.exports = ({ transaction, store }) => {
  const app = express()
  app.use(healthcheck())
  app.use(
    '/',
    bodyParser.json({
      limit: '5mb'
    }),
    graphqlExpress(req => {
      const context = {
        web: {
          protocol: req.protocol,
          hostname: process.env.WEB_HOSTNAME
        },
        userId: req.body.userId,
        transaction,
        nosql: store({
          db: nosql,
          getDataLoader: setupDataLoaderCache(nosql, {})
        }),
        store: store({
          db,
          getDataLoader: setupDataLoaderCache(db, {})
        })
      }
      return {
        schema,
        context,
        formatError
      }
    })
  )
  return app
}
