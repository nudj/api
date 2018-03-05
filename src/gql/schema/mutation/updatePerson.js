const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updatePerson(id: ID!, data: PersonUpdateInput!): Person
    }
  `,
  resolvers: {
    Mutation: {
      updatePerson: handleErrors((person, args, context) => {
        const { id, data } = args
        return context.store.update({
          type: 'people',
          id,
          data
        })
      })
    }
  }
}
