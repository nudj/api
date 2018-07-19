module.exports = {
  typeDefs: `
    extend type Person {
      role: Role
    }
  `,
  resolvers: {
    Person: {
      role: async (person, args, context) => {
        const currentPersonRole = await context.sql.readOne({
          type: 'currentPersonRoles',
          filters: {
            person: person.id
          }
        })

        if (!currentPersonRole) return null

        const personRole = await context.sql.readOne({
          type: 'personRoles',
          id: currentPersonRole.personRole
        })

        if (!personRole) return null

        return context.sql.readOne({
          type: 'roles',
          id: personRole.role
        })
      }
    }
  }
}
