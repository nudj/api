const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      storeSurveyAnswer(surveyQuestion: ID! person: ID! connections: [ID!]!): SurveyAnswer
    }
  `,
  resolvers: {
    Mutation: {
      storeSurveyAnswer: handleErrors(async (root, args, context) => {
        const { surveyQuestion, person, connections } = args
        const answer = await context.store.readOneOrCreate({
          type: 'surveyAnswers',
          filters: { surveyQuestion, person },
          data: {
            surveyQuestion,
            person,
            connections
          }
        })
        return context.store.update({
          type: 'surveyAnswers',
          id: answer.id,
          data: { connections }
        })
      })
    }
  }
}
