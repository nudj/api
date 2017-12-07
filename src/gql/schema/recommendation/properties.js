module.exports = {
  typeDefs: `
    type Recommendation {
      id: ID!
      created: DateTime!
      modified: DateTime!
      source: RecommendationSource!
    }
  `,
  resolvers: {}
}
