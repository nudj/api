const { handleErrors } = require('../../lib')
const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updateSurveySection (id: ID!, data: SurveySectionUpdateInput!): SurveySection
    }
  `,
  resolvers: {
    Mutation: {
      updateSurveySection: handleErrors(async (root, args, context) => {
        const data = args.data
        if (data.surveyQuestions) {
          data.surveyQuestions = JSON.stringify(args.data.surveyQuestions)
        }
        if (data.title) {
          data.slug = await makeUniqueSlug({
            type: 'surveySections',
            data: {
              ...data,
              id: args.id
            },
            context
          })
        }

        if (Object.keys(data).length) {
          return context.sql.update({
            type: 'surveySections',
            id: args.id,
            data
          })
        } else {
          return context.sql.readOne({
            type: 'surveySections',
            id: args.id
          })
        }
      })
    }
  }
}
