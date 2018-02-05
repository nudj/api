const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')
const schema = require('./schema')

module.exports = ({ transaction, store }) => {
  const context = { transaction, store }
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
