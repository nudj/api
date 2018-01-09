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
        return context.transaction(
          (store, params) => {
            const { person, data } = params
            return store.update({
              id: person,
              type: 'people',
              data
            })
          },
          {
            person: args.id,
            data: args.data
          }
        )
      })
    }
  }
}
