const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createPerson(input: PersonCreateInput): Person
    }
  `,
  resolvers: {
    Mutation: {
      createPerson: handleErrors((root, args, context) => {
        return context.store.create({
          type: 'people',
          data: args.input
        })
      })
    }
  }
}
