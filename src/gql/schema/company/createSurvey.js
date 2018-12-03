const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Company {
      createSurvey(data: SurveyCreateInput!): Survey
    }
  `,
  resolvers: {
    Company: {
      createSurvey: async (company, args, context) => {
        const slug = await makeUniqueSlug({
          type: 'surveys',
          data: args.data,
          context
        })

        const survey = await context.store.create({
          type: 'surveys',
          data: {
            ...args.data,
            slug,
            surveyQuestions: []
          }
        })

        await context.store.create({
          type: 'companySurveys',
          data: {
            company: company.id,
            survey: survey.id
          }
        })

        return survey
      }
    }
  }
}
