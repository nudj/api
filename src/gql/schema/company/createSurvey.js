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

        return context.sql.create({
          type: 'surveys',
          data: {
            ...args.data,
            slug,
            company: company.id,
            surveyQuestions: '[]'
          }
        })
      }
    }
  }
}
