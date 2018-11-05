module.exports = {
  typeDefs: `
    type SurveyQuestion {
      id: ID!
      created: DateTime!
      modified: DateTime!
      slug: String!
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
      survey: ID
      slug: String
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
