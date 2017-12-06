const { merge } = require('@nudj/library')

const properties = require('./properties')
const user = require('./user')
const companies = require('./companies')
const people = require('./people')
const hirers = require('./hirers')

const typeDefs = [
  properties.typeDefs,
  user.typeDefs,
  companies.typeDefs,
  people.typeDefs,
  hirers.typeDefs
]
const resolvers = merge(
  properties.resolvers,
  user.resolvers,
  companies.resolvers,
  people.resolvers,
  hirers.resolvers
)

module.exports = {
  typeDefs,
  resolvers
}
