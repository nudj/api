module.exports = {
  typeDefs: `
    extend type Mutation {
      surveyQuestions: [SurveyQuestion!]!
    }
  `,
  resolvers: {
    Mutation: {
      surveyQuestions: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'surveyQuestions'
          })
        })
      }
    }
  }
}
