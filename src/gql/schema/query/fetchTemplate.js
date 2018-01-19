const find = require('lodash/find')
const fetchContent = require('../../lib/prismic')

module.exports = {
  typeDefs: `
    extend type Query {
      fetchTemplate(
        type: String!
        repo: String!
        tags: [String!]!
        keys: Data
      ): Data
    }
  `,
  resolvers: {
    Query: {
      fetchTemplate: async (root, args) => {
        const { type, repo, tags, keys } = args
        const data = await fetchContent({ type, tags, repo, keys })
        return data && find(data, { tags })
      }
    }
  }
}
