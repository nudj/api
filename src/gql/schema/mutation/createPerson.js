const createPerson = require('../../lib/helpers/create-person')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createPerson(input: PersonCreateInput): Person
    }
  `,
  resolvers: {
    Mutation: {
      createPerson: async (root, args, context) => {
        return createPerson(context, args.input)
      }
    }
  }
}
