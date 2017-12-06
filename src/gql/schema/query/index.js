const { merge } = require('@nudj/library')

const properties = require('./properties')
const user = require('./user')
const companies = require('./companies')
const people = require('./people')
const hirers = require('./hirers')
const jobs = require('./jobs')
const applications = require('./applications')
const referrals = require('./referrals')
const connections = require('./connections')

const typeDefs = [
  properties.typeDefs,
  user.typeDefs,
  companies.typeDefs,
  people.typeDefs,
  hirers.typeDefs,
  jobs.typeDefs,
  applications.typeDefs,
  referrals.typeDefs,
  connections.typeDefs
]
const resolvers = merge(
  properties.resolvers,
  user.resolvers,
  companies.resolvers,
  people.resolvers,
  hirers.resolvers,
  jobs.resolvers,
  applications.resolvers,
  referrals.resolvers,
  connections.resolvers
)

module.exports = {
  typeDefs,
  resolvers
}
