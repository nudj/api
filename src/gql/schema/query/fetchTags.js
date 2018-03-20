const { fetchTags } = require('../../lib/prismic')
const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Query {
      fetchTags(repo: String!, type: String!): [String!]!
    }
  `,
  resolvers: {
    Query: {
      fetchTags: handleErrors(async (root, args) => {
        const { repo, type } = args
        return fetchTags({ repo, type })
      })
    }
  }
}
