module.exports = {
  typeDefs: `
    type SurveyQuestion {
      id: ID!
      slug: String!
      created: DateTime!
      modified: DateTime!
      title: String!
      description: String
      required: Boolean!
      type: SurveyQuestionType!
    }

    input SurveyQuestionCreateInput {
      title: String!
      description: String
      required: Boolean!
      type: SurveyQuestionType!
      tags: [ExpertiseTagType!]
    }

    input SurveyQuestionUpdateInput {
      title: String
      description: String
      required: Boolean
      type: SurveyQuestionType
      tags: [ExpertiseTagType!]
    }

    input SurveyQuestionFilterInput {
      id: ID
      slug: String
      survey: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
