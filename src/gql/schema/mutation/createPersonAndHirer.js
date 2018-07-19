const createPerson = require('../../lib/helpers/create-person')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createPersonAndHirer(
        person: PersonCreateInput!
        hirer: HirerAdditionalInput
      ): Person
    }
  `,
  resolvers: {
    Mutation: {
      createPersonAndHirer: async (root, args, context) => {
        const person = await createPerson(context, args.person)

        if (args.hirer) {
          await context.sql.create({
            type: 'hirers',
            data: {
              person: person.id,
              ...args.hirer
            }
          })
        }

        return person
      }
    }
  }
}
