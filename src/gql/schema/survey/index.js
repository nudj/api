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
      status: SurveyStatus!
    }

    input SurveyCreateInput {
      introTitle: String
      introDescription: String
      outroTitle: String
      outroDescription: String
      status: SurveyStatus
    }

    input SurveyUpdateInput {
      slug: String
      introTitle: String
      introDescription: String
      outroTitle: String
      outroDescription: String
      surveyQuestions: [ID!]
      status: SurveyStatus
    }

    input SurveyFilterInput {
      id: ID
      slug: String
      dateTo: DateTime
      dateFrom: DateTime
      status: SurveyStatus
    }
  `
}
