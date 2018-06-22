const { handleErrors } = require('../../lib')
const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurvey(company: ID, data: SurveyCreateInput!): Survey
    }
  `,
  resolvers: {
    Mutation: {
      createSurvey: handleErrors(async (root, args, context) => {
        const data = {
          ...args.data,
          surveySections: JSON.stringify([])
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
