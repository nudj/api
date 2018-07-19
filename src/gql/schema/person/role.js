module.exports = {
  typeDefs: `
    extend type Person {
      role: Role
    }
  `,
  resolvers: {
    Person: {
      role: async (person, args, context) => {
        const personRole = await context.store.readOne({
          type: 'personRoles',
          filters: {
            person: person.id,
            current: true
          }
        })

        if (!personRole) return null

        return context.store.readOne({
          type: 'roles',
          id: personRole.role
        })
      }
    }
  }
}
