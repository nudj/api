const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Person {
      getOrCreateConnections(connections: [ConnectionCreateInput!]!, source: String!): [Connection]
    }
  `,
  resolvers: {
    Person: {
      getOrCreateConnections: handleErrors(async (person, args, context) => {
        const from = person.id
        const { connections, source } = args
        const savedSource = await context.transaction((store, params) => {
          const { source } = params
          return store.readOneOrCreate({
            type: 'sources',
            filters: { name: source },
            data: { name: source }
          })
        }, { source })
        if (!savedSource) {
          throw new Error('Unable to create Source')
        }
        return Promise.all(connections.map(async to => {
          return context.transaction((store, params) => {
            const omit = require('lodash/omit')
            const pick = require('lodash/pick')
            const { from, to, source } = params
            return Promise.all([
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
                  role: role && role.id,
                  company: company && company.id,
                  person: person.id
                })
              })
            })
          }, {
            from,
            to,
            source: savedSource
          })
        }))
      })
    }
  }
}
