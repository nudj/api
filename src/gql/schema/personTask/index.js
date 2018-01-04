module.exports = {
  typeDefs: `
    type PersonTask {
      id: ID!
      created: DateTime!
      modified: DateTime!
      completed: Boolean!
      type: String!
    }

    input PersonTaskFilterInput {
      id: ID
      completed: Boolean
      type: String
    }

    input PersonTaskUpdateInput {
      completed: Boolean
    }
  `
}
