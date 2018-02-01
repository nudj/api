module.exports = {
  typeDefs: `
    type Hirer {
      id: ID!
      created: DateTime!
      modified: DateTime!
      onboarded: Boolean!
    }

    input HirerFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
