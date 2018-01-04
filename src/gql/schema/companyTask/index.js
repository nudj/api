module.exports = {
  typeDefs: `
    type CompanyTask {
      id: ID!
      created: DateTime!
      modified: DateTime!
      completed: Boolean!
    }

    input CompanyTaskFilterInput {
      id: ID
      completed: Boolean
    }
  `
}
