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
        const data = {
          ...args.data,
          surveyQuestions: '[]'
        }
        if (args.company) {
          data.company = args.company
        }
        data.slug = await makeUniqueSlug({
          type: 'surveys',
          data,
          context
        })
        const survey = await context.sql.create({
          type: 'surveys',
          data
        })
        return survey
      }
    }
  }
}
