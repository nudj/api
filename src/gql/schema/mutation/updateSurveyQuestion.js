const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updateSurveyQuestion (id: ID!, data: SurveyQuestionUpdateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Mutation: {
      updateSurveyQuestion: handleErrors((root, args, context) => {
        return context.store.update({
          type: 'surveyQuestions',
          id: args.id,
          data: args.data
        })
      })
    }
  }
}
