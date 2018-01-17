module.exports = {
  typeDefs: `
    extend type Person {
      getOrCreateConnection(to: ConnectionCreateInput!, source: SourceCreateInput!): Connection
    }
  `,
  resolvers: {
    Person: {
      getOrCreateConnection: (person, args, context) => {
        const from = person.id
        const { to, source } = args
        return context.transaction((store, params) => {
          const omit = require('lodash/omit')
          const pick = require('lodash/pick')
          const { from, to, source } = params
          return Promise.all([
            store.readOneOrCreate({
              type: 'sources',
              filters: { name: source.name },
              data: source
            }),
            to.title && store.readOneOrCreate({
              type: 'roles',
              filters: { name: to.title },
              data: { name: to.title }
            }),
            to.company && store.readOneOrCreate({
              type: 'companies',
              filters: { name: to.company },
              data: { name: to.company }
            }),
            store.readOneOrCreate({
              type: 'people',
              filters: { email: to.email },
              data: pick(to, ['email'])
            })
          ])
          .then(([
            source,
            role,
            company,
            person
          ]) => {
            return store.readOneOrCreate({
              type: 'connections',
              filters: {
                from,
                person: person.id
              },
              data: Object.assign({}, omit(to, ['email', 'title']), {
                from,
                source: source.id,
                role: role ? role.id : null,
                company: company ? company.id : null,
                person: person.id
              })
            })
          })
        }, {
          from,
          to,
          source
        })
      }
    }
  }
}
