module.exports = {
  typeDefs: `
    type CompanyTask {
      id: ID!
      created: DateTime!
      modified: DateTime!
      completed: Boolean!
    }
  `,
  resolvers: {}
}
