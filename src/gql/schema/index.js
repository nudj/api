const { makeExecutableSchema } = require('graphql-tools')

const { mergeDefinitions } = require('../lib')

const definitions = mergeDefinitions(
  require('./scalars'),
  require('./enums'),
  require('./query'),
  require('./mutation'),
  require('./company'),
  require('./person'),
  require('./hirer'),
  require('./job'),
  require('./application'),
  require('./referral'),
  require('./connection'),
  require('./connection-source'),
  require('./survey'),
  require('./survey-section'),
  require('./survey-question')
)

const schema = makeExecutableSchema(definitions)

module.exports = schema
