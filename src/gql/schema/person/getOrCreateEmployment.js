module.exports = {
  typeDefs: `
    extend type Person {
      getOrCreateEmployment(company: CompanyCreateInput!, source: SourceCreateInput!): Employment
    }
  `,
  resolvers: {
    Person: {
      getOrCreateEmployment: (person, args, context) => {
        return context.transaction((store, params) => {
          const {
            person,
            newCompany,
            newSource
          } = params
          return Promise.all([
            store.readOneOrCreate({
              type: 'sources',
              filters: { name: newSource.name },
              data: newSource
            }),
            store.readOneOrCreate({
              type: 'companies',
              filters: { name: newCompany.name },
              data: newCompany
            })
          ])
          .then(([
            storedSource,
            storedCompany
          ]) => {
            const source = storedSource.id
            const company = storedCompany.id
            return store.readOneOrCreate({
              type: 'employments',
              filters: {
                person,
                company
              },
              data: {
                person,
                source,
                company
              }
            })
          })
        }, {
          person: person.id,
          newCompany: args.company,
          newSource: args.source
        })
      }
    }
  }
}
