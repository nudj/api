const { merge } = require('@nudj/library')

const properties = require('./properties')
const companies = require('./companies')
const hirers = require('./hirers')

const typeDefs = [
  properties.typeDefs,
  companies.typeDefs,
  hirers.typeDefs
]
const resolvers = merge(
  properties.resolvers,
  companies.resolvers,
  hirers.resolvers
)

module.exports = {
  typeDefs,
  resolvers
}
