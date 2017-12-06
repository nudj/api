const { merge } = require('@nudj/library')

const properties = require('./properties')
const user = require('./user')
const companies = require('./companies')
const people = require('./people')
const hirers = require('./hirers')
const jobs = require('./jobs')
const applications = require('./applications')

const typeDefs = [
  properties.typeDefs,
  user.typeDefs,
  companies.typeDefs,
  people.typeDefs,
  hirers.typeDefs,
  jobs.typeDefs,
  applications.typeDefs
]
const resolvers = merge(
  properties.resolvers,
  user.resolvers,
  companies.resolvers,
  people.resolvers,
  hirers.resolvers,
  jobs.resolvers,
  applications.resolvers
)

module.exports = {
  typeDefs,
  resolvers
}
