module.exports = {
  typeDefs: `
    type Connection {
      id: ID!
      created: DateTime!
      modified: DateTime!
      firstName: String!
      lastName: String!
      source: DataSource!
    }

    input ConnectionCreateInput {
      email: String!
      firstName: String
      lastName: String
      title: String
      company: String
      source: DataSource!
    }

    input ConnectionFilterInput {
      id: ID
      person: ID
      from: ID
      dateTo: DateTime
      dateFrom: DateTime
      source: DataSource
    }
  `
}
