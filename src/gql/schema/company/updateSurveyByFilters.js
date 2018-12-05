const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')
const readOneViaEdgeCollection = require('../../lib/helpers/read-one-via-edge-collection')

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

        const survey = await readOneViaEdgeCollection({
          store: context.store,
          fromData: company,
          type: 'surveys',
          edge: 'companySurveys',
          fromPropertyName: 'company',
          toPropertyName: 'survey',
          filters
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

        return context.store.update({
          type: 'surveys',
          id: survey.id,
          data
        })
      }
    }
  }
}
