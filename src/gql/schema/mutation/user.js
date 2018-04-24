const handleErrors = require('../../lib/handle-errors')

module.exports = {
  typeDefs: `
    extend type Mutation {
      user: Person
    }
  `,
  resolvers: {
    Mutation: {
      user: handleErrors((root, args, context) => context.store.readOne({
        type: 'people',
        id: context.userId
      }))
    }
  }
}
