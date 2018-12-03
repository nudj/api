const { NotFound } = require('@nudj/library/errors')
const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Company {
      updateSurveyByFilters(filters: SurveyFilterInput!, data: SurveyUpdateInput!): Survey
    }
  `,
  resolvers: {
    Company: {
      updateSurveyByFilters: async (company, args, context) => {
        const { filters, data } = args
        const survey = await context.store.readOne({
          type: 'surveys',
          filters
        })

        if (!survey) {
          throw new Error(`Survey by filters \`${JSON.stringify(filters)}\` not found`)
        }

        const companySurvey = await context.store.readOne({
          type: 'companySurveys',
          filters: {
            survey: survey.id,
            company: company.id
          }
        })

        if (!companySurvey) {
          // survey does not belong to the company
          throw new NotFound('Survey not found')
        }

        if (data.introTitle) {
          data.slug = await makeUniqueSlug({
            type: 'surveys',
            data,
            context
          })
        }

        return context.store.update({
          type: 'surveys',
          id: survey.id,
          data
        })
      }
    }
  }
}
