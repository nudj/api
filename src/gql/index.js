const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('graphql-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const schema = require('./schema')
const resolvers = require('./resolvers')
const processCustomTypes = require('./processCustomTypes')

module.exports = ({
  storeAdaptor
}) => {
  const executableSchema = makeExecutableSchema(processCustomTypes({schema, resolvers, storeAdaptor}))
  const app = express()
  app.use('/', bodyParser.json(), graphqlExpress({
    executableSchema
  }))
  return app
}
