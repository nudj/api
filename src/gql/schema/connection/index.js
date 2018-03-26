module.exports = {
  typeDefs: `
    type Connection {
      id: ID!
      created: DateTime!
      modified: DateTime!
      firstName: String!
      lastName: String!
      source: DataSource!
      _result: ConnectionSearchResultMeta
    }

    type ConnectionSearchResultMeta {
      score: Float
      matches: Data
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
      person: ID
      from: ID
      dateTo: DateTime
      dateFrom: DateTime
      source: DataSource
    }
  `
}
