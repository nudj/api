module.exports = {
  typeDefs: `
    type Source {
      id: ID!
      created: DateTime!
      modified: DateTime!
      name: String!
    }

    input SourceCreateInput {
      name: String
    }

    input SourceFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
