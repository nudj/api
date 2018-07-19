const { fetchTags } = require('../../lib/prismic')

module.exports = {
  typeDefs: `
    extend type Mutation {
      fetchTags(repo: String!, type: String!): [String!]!
    }
  `,
  resolvers: {
    Mutation: {
      fetchTags: async (root, args) => {
        const { repo, type } = args
        return fetchTags({ repo, type })
      }
    }
  }
}
