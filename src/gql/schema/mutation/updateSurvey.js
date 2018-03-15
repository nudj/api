const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updateSurvey(id: ID!, data: SurveyUpdateInput!): Survey
    }
  `,
  resolvers: {
    Mutation: {
      updateSurvey: handleErrors((root, args, context) => {
        return context.store.update({
          type: 'surveys',
          id: args.id,
          data: args.data
        })
      })
    }
  }
}
