const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')
const { Database } = require('arangojs')

const schema = require('./schema')
const db = new Database({
  url: 'http://db:8529'
})
db.useDatabase(process.env.DB_NAME)
db.useBasicAuth(process.env.DB_USER, process.env.DB_PASS)

module.exports = ({ transaction, store }) => {
  const context = { transaction, store: store({ db }) }
  const app = express()
  app.use(
    '/',
    bodyParser.json({
      limit: '5mb'
    }),
    graphqlExpress({
      schema,
      context
    })
  )
  return app
}
