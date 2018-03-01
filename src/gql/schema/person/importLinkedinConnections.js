const formatLinkedinConnections = require('../../lib/helpers/format-linkedin-connections')
const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Person {
      importLinkedinConnections(connections: [Data!]!, source: String!): [Connection]
    }
  `,
  resolvers: {
    Person: {
      importLinkedinConnections: handleErrors(async (person, args, context) => {
        const { connections, source } = args
        const formattedConnections = formatLinkedinConnections(connections)
        const from = person.id

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
        return Promise.all(formattedConnections.map(async to => {
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
                  data: { name: to.company, client: false }
                })
              ])
              .then(([
                person,
                source,
                role,
                company
              ]) => {
                return store.create({
                  type: 'connections',
                  data: Object.assign({}, omit(to, ['email', 'title']), {
                    from,
                    source: source.id,
                    role: role ? role.id : null,
                    company: company ? company.id : null,
                    person: person.id
                  })
                })
                .then(connection => Object.assign({}, connection, {
                  source,
                  role,
                  company,
                  person
                }))
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
