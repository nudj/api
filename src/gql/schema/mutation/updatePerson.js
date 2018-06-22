const { handleErrors } = require('../../lib')
const updatePerson = require('../../lib/helpers/update-person')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updatePerson(id: ID!, data: PersonUpdateInput!): Person
    }
  `,
  resolvers: {
    Mutation: {
      updatePerson: handleErrors(async (root, args, context) => {
        const { id, data } = args
        return updatePerson(context, id, data)
      })
    }
  }
}
