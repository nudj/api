module.exports = {
  typeDefs: `
    type Hirer {
      id: ID!
      created: DateTime!
      modified: DateTime!
      type: HirerType!
      onboarded: Boolean!
    }

    input HirerCreateInput {
      company: ID!
      email: String!
      type: HirerType
      onboarded: Boolean
    }

    input HirerFilterInput {
      id: ID
      dateTo: DateTime
      type: HirerType
      dateFrom: DateTime
    }
  `
}
