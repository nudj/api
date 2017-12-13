module.exports = {
  typeDefs: `
    type PersonTask {
      id: ID!
      created: DateTime!
      modified: DateTime!
      completed: Boolean!
    }

    input PersonTaskFilterInput {
      id: ID
      completed: Boolean
    }
  `
}
