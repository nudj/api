module.exports = {
  typeDefs: `
    type SurveyAnswer {
      id: ID!
      created: DateTime!
      modified: DateTime!
    }

    input SurveyAnswerFilterInput {
      id: ID
    }
  `
}
