module.exports = {
  typeDefs: `
    type Account {
      id: ID!
      email: String!
      emails: [String!]
      created: DateTime!
      modified: DateTime!
      type: AccountType!
    }
  `
}
