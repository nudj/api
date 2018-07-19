const omitBy = require('lodash/omitBy')
const isUndefined = require('lodash/isUndefined')

module.exports = {
  typeDefs: `
    extend type Query {
      hirersAsPeople(company: ID): [Person!]!
    }
  `,
  resolvers: {
    Query: {
      hirersAsPeople: async (root, args, context) => {
        const hirers = await context.store.readAll({
          type: 'hirers',
          filters: omitBy({ company: args.company }, isUndefined)
        })

        return context.store.readMany({
          type: 'people',
          ids: hirers.map(hirer => hirer.person)
        })
      }
    }
  }
}
