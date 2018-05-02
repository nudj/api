module.exports = {
  typeDefs: `
    type JobViewEvent {
      id: ID!
      created: DateTime!
      modified: DateTime!
      job: ID!
      browserId: String!
    }
  `
}
