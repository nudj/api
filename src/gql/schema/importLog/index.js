module.exports = {
  typeDefs: `
    type ImportLog {
      error: Boolean!
      errors: Int!
      created: Int!
      empty: Int!
      updated: Int!
      ignored: Int!
      details: [String!]!
      collection: String!
    }
  `
}
