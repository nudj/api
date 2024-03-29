const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updateSurvey(id: ID!, data: SurveyUpdateInput!): Survey
    }
  `,
  resolvers: {
    Mutation: {
      updateSurvey: async (root, args, context) => {
        const data = args.data
        if (data.surveyQuestions) {
          data.surveyQuestions = JSON.stringify(args.data.surveyQuestions)
        }
        if (data.introTitle) {
          data.slug = await makeUniqueSlug({
            type: 'surveys',
            data: {
              ...data,
              id: args.id
            },
            context
          })
        }

        if (Object.keys(data).length) {
          return context.sql.update({
            type: 'surveys',
            id: args.id,
            data
          })
        } else {
          return context.sql.readOne({
            type: 'surveys',
            id: args.id
          })
        }
      }
    }
  }
}
