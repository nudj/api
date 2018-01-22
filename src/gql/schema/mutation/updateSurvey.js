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
        return context.transaction(
          (store, params) => {
            return store.update({
              type: 'surveys',
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
