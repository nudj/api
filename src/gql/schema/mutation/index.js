module.exports = {
  typeDefs: `
    type Mutation {
      version: String!
    }
  `,
  resolvers: {
    Mutation: {
      version: () => process.env.npm_package_version
    }
  }
}
