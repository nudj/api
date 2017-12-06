const { makeExecutableSchema } = require('graphql-tools')
const { merge } = require('@nudj/library')

const scalars = require('./scalars')
const company = require('./company')
const hirer = require('./hirer')

const typeDefs = [
  `type Query {
    version: Int!
  }`,
  `type Mutation {
    version: Int!
  }`,
  ...scalars.typeDefs,
  ...company.typeDefs,
  ...hirer.typeDefs
]
const resolvers = merge(
  {
    Query: {
      version: () => process.env.npm_package_version
    },
    Mutation: {
      version: () => process.env.npm_package_version
    }
  },
  scalars.resolvers,
  company.resolvers,
  hirer.resolvers
)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

module.exports = schema
