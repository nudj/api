const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurvey(company: ID, data: SurveyCreateInput!): Survey
    }
  `,
  resolvers: {
    Mutation: {
      createSurvey: handleErrors(async (root, args, context) => {
        const survey = await context.sql.create({
          type: 'surveys',
          data: {
            ...args.data,
            surveySections: []
          }
        })
        if (args.company) {
          await context.sql.create({
            type: 'companySurveys',
            data: {
              company: args.company,
              survey: survey.id
            }
          })
        }
        return survey
      })
    }
  }
}
