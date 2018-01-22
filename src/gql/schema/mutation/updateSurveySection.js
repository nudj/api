const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updateSurveySection (id: ID!, data: SurveySectionUpdateInput!): SurveySection
    }
  `,
  resolvers: {
    Mutation: {
      updateSurveySection: handleErrors((root, args, context) => {
        return context.transaction(
          (store, params) => {
            return store.update({
              type: 'surveySections',
              id: params.id,
              data: params.data
            })
          },
          {
            id: args.id,
            data: args.data
          }
        )
      })
    }
  }
}
