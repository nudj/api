module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurvey(company: ID, data: SurveyCreateInput!): Survey
    }
  `,
  resolvers: {
    Mutation: {
      createSurvey: async (root, args, context) => {
        const survey = await context.store.create({
          type: 'surveys',
          data: {
            ...args.data,
            surveyQuestions: []
          }
        })
        if (args.company) {
          await context.store.create({
            type: 'companySurveys',
            data: {
              company: args.company,
              survey: survey.id
            }
          })
        }
        return survey
      }
    }
  }
}
