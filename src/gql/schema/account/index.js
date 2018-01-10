module.exports = {
  typeDefs: `
    type Account {
      id: ID!
      created: DateTime!
      modified: DateTime!
      type: AccountType!
      data: Data!
    }
  `
}
