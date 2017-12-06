const { merge } = require('@nudj/library')

const properties = require('./properties')

const typeDefs = [
  properties.typeDefs
]
const resolvers = merge(
  properties.resolvers
)

module.exports = {
  typeDefs,
  resolvers
}
