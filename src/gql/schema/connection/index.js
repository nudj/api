module.exports = {
  typeDefs: `
    type Connection {
      id: ID!
      created: DateTime!
      modified: DateTime!
      firstName: String!
      lastName: String!
    }

    input ConnectionFilterInput {
      id: ID
    }
  `
}
