module.exports = {
  typeDefs: `
    type ConnectionSource {
      id: ID!
      created: DateTime!
      modified: DateTime!
      name: String!
    }

    input ConnectionSourceFilterInput {
      id: ID
    }
  `
}
