const omitBy = require('lodash/omitBy')
const isUndefined = require('lodash/isUndefined')
const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Query {
      hirersAsPeople(company: ID): [Person!]!
    }
  `,
  resolvers: {
    Query: {
      hirersAsPeople: handleErrors(async (root, args, context) => {
        const hirers = await context.store.readAll({
          type: 'hirers',
          filters: omitBy({ company: args.company }, isUndefined)
        })

        return context.store.readMany({
          type: 'people',
          ids: hirers.map(hirer => hirer.person)
        })
      })
    }
  }
}
