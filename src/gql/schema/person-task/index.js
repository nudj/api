module.exports = {
  typeDefs: `
    type PersonTask {
      id: ID!
      created: DateTime!
      modified: DateTime!
      completed: Boolean!
    }
  `,
  resolvers: {}
}
