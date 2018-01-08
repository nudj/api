const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Person {
      getOrCreateConnections(to: [ConnectionCreateInput!]!, source: SourceCreateInput!): [Connection]
    }
  `,
  resolvers: {
    Person: {
      getOrCreateConnections: handleErrors(async (person, args, context) => {
        const from = person.id
        const { to, source } = args
        const savedSource = await context.transaction((store, params) => {
          const { source } = params
          return store.readOneOrCreate({
            type: 'sources',
            filters: { name: source.name },
            data: source
          })
        }, { source })
        if (!savedSource) {
          throw new Error('Unable to create Source')
        }
        return Promise.all(to.map(async data => {
          return context.transaction((store, params) => {
            const omit = require('lodash/omit')
            const pick = require('lodash/pick')
            const { from, source } = params
            return Promise.all([
              data.title && store.readOneOrCreate({
                type: 'roles',
                filters: { name: data.title },
                data: { name: data.title }
              }),
              data.company && store.readOneOrCreate({
                type: 'companies',
                filters: { name: data.company },
                data: { name: data.company }
              }),
              store.readOneOrCreate({
                type: 'people',
                filters: { email: data.email },
                data: pick(data, ['email'])
              })
            ])
            .then(([
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
                data: Object.assign({}, omit(data, ['email', 'title']), {
                  from,
                  source: source.id,
                  role: role && role.id,
                  company: company && company.id,
                  person: person.id
                })
              })
            })
          }, {
            from,
            source: savedSource
          })
        }))
      })
    }
  }
}
