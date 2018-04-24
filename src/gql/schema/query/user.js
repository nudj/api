const handleErrors = require('../../lib/handle-errors')

module.exports = {
  typeDefs: `
    extend type Query {
      user: Person
    }
  `,
  resolvers: {
    Query: {
      user: handleErrors((root, args, context) => context.store.readOne({
        type: 'people',
        id: context.userId
      }))
    }
  }
}
