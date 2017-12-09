module.exports = {
  typeDefs: `
    type Survey {
      id: ID!
      created: DateTime!
      modified: DateTime!
      slug: String!
      introTitle: String
      introDescription: String
      outroTitle: String
      outroDescription: String
    }
  `
}
