module.exports = {
  typeDefs: `
    type Connection {
      id: ID!
      created: DateTime!
      modified: DateTime!
      firstName: String!
      lastName: String!
    }

    input ConnectionCreateInput {
      email: String!
      firstName: String
      lastName: String
      title: String
      company: String
    }

    input ConnectionFilterInput {
      id: ID
    }
  `
}
