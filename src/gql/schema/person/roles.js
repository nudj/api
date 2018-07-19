module.exports = {
  typeDefs: `
    extend type Person {
      roles: [Role!]!
    }
  `,
  resolvers: {
    Person: {
      roles: async (person, args, context) => {
        const personRoles = await context.sql.readAll({
          type: 'personRoles',
          filters: { person: person.id }
        })

        return context.sql.readMany({
          type: 'roles',
          ids: personRoles.map(personRole => personRole.role)
        })
      }
    }
  }
}
