const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')
const schema = require('./schema')

module.exports = ({ transaction }) => {
  const context = { transaction }
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
