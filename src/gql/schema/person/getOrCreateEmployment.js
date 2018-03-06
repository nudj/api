module.exports = {
  typeDefs: `
    extend type Person {
      getOrCreateEmployment(company: String!, source: DataSource!): Employment
    }
  `,
  resolvers: {
    Person: {
      getOrCreateEmployment: async (person, args, context) => {
        const { company: newCompany, source } = args

        let company = await context.store.readOne({
          type: 'companies',
          filters: { name: newCompany }
        })
        const employment = company && await context.store.readOne({
          type: 'employments',
          filters: {
            person: person.id,
            company: company.id
          }
        })
        if (employment) return { ...employment, company }

        if (!company) {
          company = await context.store.create({
            type: 'companies',
            data: { name: newCompany, client: false }
          })
        }
        const newEmployment = await context.store.create({
          type: 'employments',
          data: {
            person: person.id,
            source: source,
            company: company.id
          }
        })
        return { ...newEmployment, company }
      }
    }
  }
}
