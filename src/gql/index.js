const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')
const { Database } = require('arangojs')

const schema = require('./schema')
const { DB_URL: url } = require('./lib/constants')
const setupDataLoaderCache = require('./lib/setup-dataloader-cache')

const db = new Database({ url })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const noSQL = new Database({ url })
noSQL.useDatabase(process.env.NO_SQL_NAME)
noSQL.useBasicAuth(process.env.NO_SQL_USER, process.env.NO_SQL_PASS)

module.exports = ({ transaction, store }) => {
  const app = express()
  app.use(
    '/',
    bodyParser.json({
      limit: '5mb'
    }),
    graphqlExpress(req => {
      const getDataLoader = setupDataLoaderCache(db, {})
      const context = {
        web: {
          protocol: req.protocol,
          hostname: process.env.WEB_HOSTNAME
        },
        userId: req.body.userId,
        transaction,
        noSQL: store({
          db: noSQL,
          getDataLoader
        }),
        store: store({
          db,
          getDataLoader
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
