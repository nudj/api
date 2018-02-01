module.exports = {
  typeDefs: `
    type SurveyQuestion {
      id: ID!
      created: DateTime!
      modified: DateTime!
      title: String!
      description: String
      name: String!
      required: Boolean!
      type: SurveyQuestionType!
    }

    input SurveyQuestionCreateInput {
      title: String!
      description: String
      name: String!
      required: Boolean!
      type: SurveyQuestionType!
    }

    input SurveyQuestionUpdateInput {
      title: String
      description: String
      name: String
      required: Boolean
      type: SurveyQuestionType
    }

    input SurveyQuestionFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
