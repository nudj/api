const { NotFound } = require('@nudj/library/errors')
const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Survey {
      updateSurveyQuestionByFilters(filters: SurveyQuestionFilterInput!, data: SurveyQuestionUpdateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Survey: {
      updateSurveyQuestionByFilters: async (survey, args, context) => {
        const { filters, data } = args

        const question = await context.store.readOne({
          type: 'surveyQuestions',
          filters
        })

        if (!question || question.survey !== survey.id) {
          throw new NotFound(`SurveyQuestion by filters \`${JSON.stringify(filters)}\` not found`)
        }

        if (data.title) {
          data.slug = await makeUniqueSlug({
            type: 'surveyQuestions',
            data,
            context
          })
        }

        return context.store.update({
          type: 'surveyQuestions',
          id: question.id,
          data
        })
      }
    }
  }
}
