const { makeExecutableSchema } = require('graphql-tools')
const { merge } = require('@nudj/library')

const scalars = require('./scalars')
const query = require('./query')
const mutation = require('./mutation')
const company = require('./company')
const person = require('./person')
const hirer = require('./hirer')

const typeDefs = [
  ...scalars.typeDefs,
  ...query.typeDefs,
  ...mutation.typeDefs,
  ...company.typeDefs,
  ...person.typeDefs,
  ...hirer.typeDefs
]
const resolvers = merge(
  scalars.resolvers,
  query.resolvers,
  mutation.resolvers,
  company.resolvers,
  person.resolvers,
  hirer.resolvers
)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

module.exports = schema
