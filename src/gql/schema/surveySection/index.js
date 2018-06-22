module.exports = {
  typeDefs: `
    type SurveySection {
      id: ID!
      created: DateTime!
      modified: DateTime!
      slug: String!
      title: String!
      description: String
    }

    input SurveySectionCreateInput {
      title: String!
      description: String
    }

    input SurveySectionUpdateInput {
      title: String
      description: String
      surveyQuestions: [ID!]
    }

    input SurveySectionFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
