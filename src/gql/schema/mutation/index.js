const { merge } = require('@nudj/library')

const properties = require('./properties')
const user = require('./user')
const people = require('./people')
const companies = require('./companies')
const hirers = require('./hirers')

const typeDefs = [
  properties.typeDefs,
  user.typeDefs,
  people.typeDefs,
  companies.typeDefs,
  hirers.typeDefs
]
const resolvers = merge(
  properties.resolvers,
  user.resolvers,
  people.resolvers,
  companies.resolvers,
  hirers.resolvers
)

module.exports = {
  typeDefs,
  resolvers
}
