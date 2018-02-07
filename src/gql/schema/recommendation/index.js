module.exports = {
  typeDefs: `
    type Recommendation {
      id: ID!
      created: DateTime!
      modified: DateTime!
      source: RecommendationSource!
    }

    input RecommendationFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
