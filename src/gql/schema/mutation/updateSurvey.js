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
        if (args.data.introTitle) {
          args.data.slug = await makeUniqueSlug({
            type: 'surveys',
            data: args.data,
            context
          })
        }

        return context.store.update({
          type: 'surveys',
          id: args.id,
          data: args.data
        })
      }
    }
  }
}
