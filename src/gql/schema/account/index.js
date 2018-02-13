module.exports = {
  typeDefs: `
    type Account {
      id: ID!
      emailAddress: String!
      emailAddresses: [String!]
      created: DateTime!
      modified: DateTime!
      type: AccountType!
    }
  `
}
