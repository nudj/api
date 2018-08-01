module.exports = {
  typeDefs: `
    type AccessRequest {
      id: ID!
      slug: String!
      created: DateTime!
      modified: DateTime!
    }

    input AccessRequestFilterInput {
      slug: String
      person: ID
      company: ID
    }
  `
}
