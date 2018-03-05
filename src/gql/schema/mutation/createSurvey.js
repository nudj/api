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
        return context.store.create({
          type: 'surveys',
          data: Object.assign({}, args.data, {
            company: args.company,
            surveySections: []
          })
        })
      })
    }
  }
}
