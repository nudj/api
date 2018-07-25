module.exports = {
  typeDefs: `
    type MessageEvent {
      id: ID!
      created: DateTime!
      modified: DateTime!
      hash: String!
    }
  `
}
