module.exports = {
  typeDefs: `
    extend type Person {
      company: Company
    }
  `,
  resolvers: {
    Person: {
      company: async (person, args, context) => {
        const currentEmployment = await context.sql.readOne({
          type: 'currentEmployments',
          filters: {
            person: person.id
          }
        })

        if (!currentEmployment) return null

        const employment = await context.sql.readOne({
          type: 'employments',
          id: currentEmployment.employment
        })

        if (!employment) return null

        return context.sql.readOne({
          type: 'companies',
          id: employment.company
        })
      }
    }
  }
}
