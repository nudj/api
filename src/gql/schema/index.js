const { makeExecutableSchema } = require('graphql-tools')

const { definitionMerger } = require('../lib')

const definitions = definitionMerger(
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
