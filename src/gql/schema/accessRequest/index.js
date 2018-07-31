module.exports = {
  typeDefs: `
    type AccessRequest {
      id: ID!
      created: DateTime!
      modified: DateTime!
    }

    input AccessRequestFilterInput {
      person: ID
      company: ID
    }
  `
}
