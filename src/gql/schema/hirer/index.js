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
      person: ID!
      type: HirerType!
      onboarded: Boolean
    }

    # Usage: When person ID cannot be provided beforehand, i.e. when person is
    # fetched/created inside resolver or passed in through context.
    input HirerAdditionalInput {
      company: ID!
      type: HirerType!
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
