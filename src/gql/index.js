const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')
const { Database } = require('arangojs')
const DataLoader = require('dataloader')

const schema = require('./schema')
const { DB_URL: url } = require('./lib/constants')

const db = new Database({ url })
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

const setupDataLoaderCache = cache => type => {
  if (!cache[type]) {
    cache[type] = new DataLoader(keys => db.collection(type).lookupByKeys(keys))
  }
  return cache[type]
}

module.exports = ({ transaction, store }) => {
  const app = express()
  app.use(
    '/',
    bodyParser.json({
      limit: '5mb'
    }),
    graphqlExpress(req => {
      const getDataLoader = setupDataLoaderCache({})
      const context = {
        transaction,
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
