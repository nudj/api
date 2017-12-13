module.exports = {
  typeDefs: `
    type SurveySection {
      id: ID!
      created: DateTime!
      modified: DateTime!
      title: String!
      description: String
    }

    input SurveySectionFilterInput {
      id: ID
    }
  `
}
