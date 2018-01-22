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
        return context.transaction(
          (store, params) => {
            return store.update({
              type: 'surveyQuestions',
              id: params.id,
              data: params.data
            })
          },
          {
            id: args.id,
            data: args.data
          }
        )
      })
    }
  }
}
