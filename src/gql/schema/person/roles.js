const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Person {
      roles: [Role!]!
    }
  `,
  resolvers: {
    Person: {
      roles: handleErrors(async (person, args, context) => {
        const personRoles = await context.store.readAll({
          type: 'personRoles',
          filters: { person: person.id }
        })

        return context.store.readMany({
          type: 'roles',
          ids: personRoles.map(personRole => personRole.role)
        })
      })
    }
  }
}
