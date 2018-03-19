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
      tags: [String!]
    }

    input SurveyQuestionCreateInput {
      title: String!
      description: String
      name: String!
      required: Boolean!
      type: SurveyQuestionType!
      tags: [String!]
    }

    input SurveyQuestionUpdateInput {
      title: String
      description: String
      name: String
      required: Boolean
      type: SurveyQuestionType
      tags: [String!]
    }

    input SurveyQuestionFilterInput {
      id: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
