module.exports = {
  typeDefs: `
    type Account {
      id: ID!
      email: String!
      # Caching array of email addresses returned from Google in case a user
      # authorises with one of their account's alias email addresses
      emailAddresses: [String!]
      created: DateTime!
      modified: DateTime!
      type: AccountType!
    }

    input AccountCreateInput {
      email: String!
      emailAddresses: [String!]
      type: AccountType!
      data: Data!
    }

    input AccountFilterInput {
      id: ID
      email: String
      type: AccountType
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
