module.exports = {
  typeDefs: `
    type Application {
      id: ID!
      created: DateTime!
      modified: DateTime!
    }

    input ApplicationFilterInput {
      id: ID
      person: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
