module.exports = {
  typeDefs: `
    extend type Query {
      surveyQuestions: [SurveyQuestion!]!
    }
  `,
  resolvers: {
    Query: {
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
