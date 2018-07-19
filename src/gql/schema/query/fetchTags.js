const { fetchTags } = require('../../lib/prismic')

module.exports = {
  typeDefs: `
    extend type Query {
      fetchTags(repo: String!, type: String!): [String!]!
    }
  `,
  resolvers: {
    Query: {
      fetchTags: async (root, args) => {
        const { repo, type } = args
        return fetchTags({ repo, type })
      }
    }
  }
}
