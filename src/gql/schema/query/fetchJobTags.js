const { fetchTags } = require('../../lib/prismic')
const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Query {
      fetchJobTags: [String!]!
    }
  `,
  resolvers: {
    Query: {
      fetchJobTags: handleErrors(async (root, args) => {
        return fetchTags()
      })
    }
  }
}
