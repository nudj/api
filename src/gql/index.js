const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('graphql-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const schema = require('./schema')
const resolvers = require('./resolvers')
const processCustomTypes = require('./processCustomTypes')

module.exports = ({ transaction }) => {
  const executableSchema = makeExecutableSchema(
    processCustomTypes({
      customTypeDefs: schema,
      customResolvers: resolvers({ transaction }),
      transaction
    })
  )
  const app = express()
  app.use(
    '/',
    bodyParser.json({ limit: '5mb' }),
    graphqlExpress({
      schema: executableSchema
    })
  )
  return app
}
