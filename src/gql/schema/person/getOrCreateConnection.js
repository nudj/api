const omit = require('lodash/omit')
const pick = require('lodash/pick')

module.exports = {
  typeDefs: `
    extend type Person {
      getOrCreateConnection(to: ConnectionCreateInput!, source: DataSource!): Connection
    }
  `,
  resolvers: {
    Person: {
      getOrCreateConnection: async (person, args, context) => {
        const from = person.id
        const { to, source } = args

        const savedPerson = await context.store.readOne({
          type: 'people',
          filters: { email: to.email }
        })
        const savedConnection = savedPerson && await context.store.readOne({
          type: 'connections',
          filters: {
            from,
            person: savedPerson.id
          }
        })
        if (savedConnection) {
          return { ...savedConnection, person: savedPerson }
        }

        const [ personFromConnection, role, company ] = await Promise.all([
          savedPerson || context.store.create({
            type: 'people',
            data: pick(to, ['email'])
          }),
          to.title && context.store.readOneOrCreate({
            type: 'roles',
            filters: { name: to.title },
            data: { name: to.title }
          }),
          to.company && context.store.readOneOrCreate({
            type: 'companies',
            filters: { name: to.company },
            data: { name: to.company, client: false }
          })
        ])
        const connection = await context.store.create({
          type: 'connections',
          data: {
            ...omit(to, ['email', 'title']),
            from,
            source,
            role: role ? role.id : null,
            company: company ? company.id : null,
            person: personFromConnection.id
          }
        })

        return {
          ...connection,
          role,
          company,
          person: personFromConnection
        }
      }
    }
  }
}
