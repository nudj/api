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

    input SurveyCreateInput {
      slug: String!
      introTitle: String
      introDescription: String
      outroTitle: String
      outroDescription: String
    }

    input SurveyUpdateInput {
      slug: String
      introTitle: String
      introDescription: String
      outroTitle: String
      outroDescription: String
      surveySections: [ID!]
    }

    input SurveyFilterInput {
      id: ID
      slug: String
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
