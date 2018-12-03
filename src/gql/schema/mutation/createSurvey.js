const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurvey(company: ID, data: SurveyCreateInput!): Survey
    }
  `,
  resolvers: {
    Mutation: {
      createSurvey: async (root, args, context) => {
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
