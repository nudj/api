const { fetchTags } = require('../../lib/prismic')
const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      fetchTags(repo: String!, type: String!): [String!]!
    }
  `,
  resolvers: {
    Mutation: {
      fetchTags: handleErrors(async (root, args) => {
        const { repo, type } = args
        return fetchTags({ repo, type })
      })
    }
  }
}
