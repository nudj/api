const { makeExecutableSchema } = require('graphql-tools')

const { mergeDefinitions } = require('../lib')

const definitions = mergeDefinitions(
  require('./scalars'),
  require('./query'),
  require('./mutation'),
  require('./company'),
  require('./person'),
  require('./hirer'),
  require('./job'),
  require('./application'),
  require('./referral'),
  require('./connection'),
  require('./connection-source')
)

const schema = makeExecutableSchema(definitions)

module.exports = schema
