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
        const hirers = await context.sql.readAll({
          type: 'hirers',
          filters: omitBy({ company: args.company }, isUndefined)
        })

        return context.sql.readMany({
          type: 'people',
          ids: hirers.map(hirer => hirer.person)
        })
      }
    }
  }
}
