module.exports = {
  typeDefs: `
    type Account {
      id: ID!
      emailAddress: String!
      # Caching array of email addresses returned from Google in case a user
      # authorises with one of their account's alias email addresses
      emailAddresses: [String!]
      created: DateTime!
      modified: DateTime!
      type: AccountType!
    }

    input AccountFilterInput {
      id: ID
      emailAddress: String
      type: AccountType
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
