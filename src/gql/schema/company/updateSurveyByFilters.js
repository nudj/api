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

        const survey = await context.sql.readOne({
          type: 'surveys',
          filters: {
            ...filters,
            company: company.id
          }
        })

        if (!survey) {
          throw new Error(`Survey by filters \`${JSON.stringify(filters)}\` not found`)
        }

        if (data.introTitle) {
          data.slug = await makeUniqueSlug({
            type: 'surveys',
            data,
            context
          })
        }

        if (data.surveyQuestions && typeof data.surveyQuestions !== 'string') {
          data.surveyQuestions = JSON.stringify(data.surveyQuestions)
        }

        return context.sql.update({
          type: 'surveys',
          id: survey.id,
          data
        })
      }
    }
  }
}
