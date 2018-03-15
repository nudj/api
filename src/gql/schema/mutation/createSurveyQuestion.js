const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveyQuestion(surveySection: ID!, data: SurveyQuestionCreateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Mutation: {
      createSurveyQuestion: handleErrors(async (root, args, context) => {
        const question = await context.store.create({
          type: 'surveyQuestions',
          data: {
            ...args.data,
            surveySection: args.surveySection
          }
        })
        const { surveyQuestions = [] } = await context.store.readOne({
          type: 'surveySections',
          id: question.surveySection
        })

        await context.store.update({
          type: 'surveySections',
          id: question.surveySection,
          data: {
            surveyQuestions: surveyQuestions.concat(question.id)
          }
        })

        return Promise.resolve(question)
      })
    }
  }
}
