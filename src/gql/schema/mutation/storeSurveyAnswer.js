module.exports = {
  typeDefs: `
    extend type Mutation {
      storeSurveyAnswer(surveyQuestion: ID! person: ID! connections: [ID!]!): SurveyAnswer
    }
  `,
  resolvers: {
    Mutation: {
      storeSurveyAnswer: (root, args, context) => {
        return context.transaction((store, params) => {
          const { surveyQuestion, person, connections } = params.args
          return store.readOneOrCreate({
            type: 'surveyAnswers',
            filters: { surveyQuestion, person },
            data: {
              surveyQuestion,
              person,
              connections
            }
          })
          .then(answer => {
            return store.update({
              type: 'surveyAnswers',
              id: answer.id,
              data: { connections }
            })
          })
        }, {
          args
        })
      }
    }
  }
}
