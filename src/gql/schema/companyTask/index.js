module.exports = {
  typeDefs: `
    type CompanyTask {
      id: ID!
      created: DateTime!
      modified: DateTime!
      completed: Boolean!
      type: String!
    }

    input CompanyTaskFilterInput {
      id: ID
      completed: Boolean
      type: String
      completedBy: ID
    }
  `
}
