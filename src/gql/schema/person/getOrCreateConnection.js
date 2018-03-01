module.exports = {
  typeDefs: `
    extend type Person {
      getOrCreateConnection(to: ConnectionCreateInput!, source: DataSource!): Connection
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

          return store.readOne({
            type: 'people',
            filters: { email: to.email }
          })
          .then(person => Promise.all([
            person,
            person && store.readOne({
              type: 'connections',
              filters: {
                from,
                person: person.id
              }
            })
          ]))
          .then(([
            person,
            connection
          ]) => {
            if (connection) return Object.assign({}, connection, { person })
            return Promise.all([
              person || store.create({
                type: 'people',
                data: pick(to, ['email'])
              }),
              to.title && store.readOneOrCreate({
                type: 'roles',
                filters: { name: to.title },
                data: { name: to.title }
              }),
              to.company && store.readOneOrCreate({
                type: 'companies',
                filters: { name: to.company },
                data: { name: to.company, client: false }
              })
            ])
            .then(([
              person,
              role,
              company
            ]) => {
              return store.create({
                type: 'connections',
                data: Object.assign({}, omit(to, ['email', 'title']), {
                  from,
                  source,
                  role: role ? role.id : null,
                  company: company ? company.id : null,
                  person: person.id
                })
              })
              .then(connection => Object.assign({}, connection, {
                role,
                company,
                person
              }))
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
