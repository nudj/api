const { fetchContent } = require('../../lib/prismic')

module.exports = {
  typeDefs: `
    extend type Mutation {
      fetchTemplate(
        type: String!
        repo: String!
        tags: [String!]!
        keys: Data
      ): Data
    }
  `,
  resolvers: {
    Mutation: {
      fetchTemplate: async (root, args) => {
        const { type, repo, tags, keys } = args
        const data = await fetchContent({ type, tags, repo, keys })
        return data && data[0]
      }
    }
  }
}
