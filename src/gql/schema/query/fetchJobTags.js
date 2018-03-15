const { fetchTags } = require('../../lib/prismic')

module.exports = {
  typeDefs: `
    extend type Query {
      fetchJobTags: [String!]!
    }
  `,
  resolvers: {
    Query: {
      fetchJobTags: async (root, args) => {
        return fetchTags()
      }
    }
  }
}
