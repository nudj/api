module.exports = {
  typeDefs: `
    extend type Person {
      getOrCreateEmployment(company: String!, source: String!): Employment
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

          return store.readOne({
            type: 'companies',
            filters: { name: newCompany }
          })
          .then(company => Promise.all([
            company,
            company && store.readOne({
              type: 'employments',
              filters: {
                person: person.id,
                company: company.id
              }
            })
          ]))
          .then(([
            company,
            employment
          ]) => {
            if (employment) return Object.assign({}, employment, { company })
            return Promise.all([
              company || store.create({
                type: 'companies',
                data: { name: newCompany, client: false }
              }),
              store.readOneOrCreate({
                type: 'sources',
                filters: { name: newSource },
                data: { name: newSource }
              })
            ])
            .then(([
              company,
              source
            ]) => {
              return store.create({
                type: 'employments',
                data: {
                  person: person.id,
                  source: source.id,
                  company: company.id
                }
              })
              .then(employment => Object.assign({}, employment, {
                company,
                source
              }))
            })
          })
        }, {
          person,
          newCompany: args.company,
          newSource: args.source
        })
      }
    }
  }
}
