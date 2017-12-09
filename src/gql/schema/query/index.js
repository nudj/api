module.exports = {
  typeDefs: `
    type Query {
      version: String!
    }
  `,
  resolvers: {
    Query: {
      version: () => process.env.npm_package_version
    }
  }
}
