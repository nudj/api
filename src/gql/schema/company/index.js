const { merge } = require('@nudj/library')

const properties = require('./properties')
const hirers = require('./hirers')

const typeDefs = [
  properties.typeDefs,
  hirers.typeDefs
]
const resolvers = merge(
  properties.resolvers,
  hirers.resolvers
)

module.exports = {
  typeDefs,
  resolvers
}
