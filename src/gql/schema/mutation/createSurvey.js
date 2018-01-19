const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurvey(company: ID!, data: SurveyCreateInput!): Survey
    }
  `,
  resolvers: {
    Mutation: {
      createSurvey: handleErrors((root, args, context) => {
        return context.transaction(
          (store, params) => {
            return store.create({
              type: 'surveys',
              data: Object.assign({}, params.data, {
                company: params.company,
                surveySections: []
              })
            })
          },
          {
            data: args.data,
            company: args.company
          }
        )
      })
    }
  }
}
