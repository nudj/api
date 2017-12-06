const { merge } = require('@nudj/library')

const properties = require('./properties')
const user = require('./user')
const people = require('./people')
const companies = require('./companies')
const hirers = require('./hirers')
const jobs = require('./jobs')
const applications = require('./applications')

const typeDefs = [
  properties.typeDefs,
  user.typeDefs,
  people.typeDefs,
  companies.typeDefs,
  hirers.typeDefs,
  jobs.typeDefs,
  applications.typeDefs
]
const resolvers = merge(
  properties.resolvers,
  user.resolvers,
  people.resolvers,
  companies.resolvers,
  hirers.resolvers,
  jobs.resolvers,
  applications.resolvers
)

module.exports = {
  typeDefs,
  resolvers
}
