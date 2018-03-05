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
        return context.store.update({
          type: 'surveySections',
          id: args.id,
          data: args.data
        })
      })
    }
  }
}
