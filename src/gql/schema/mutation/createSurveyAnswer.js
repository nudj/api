module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveyAnswer(surveyQuestion: ID! person: ID! connections: [ID!]!): SurveyAnswer
    }
  `,
  resolvers: {
    Mutation: {
      createSurveyAnswer: (obj, args, context) => {
        return context.transaction((store, params) => {
          const { surveyQuestion, person, connections } = params.args
          return store.create({
            type: 'surveyAnswers',
            data: {
              surveyQuestion,
              person,
              connections
            }
          })
        }, {
          args
        })
      }
    }
  }
}
