const sortBy = require('lodash/sortBy')

const handleErrors = require('../../lib/handle-errors')
const fetchConnectionPropertyMap = require('../../lib/helpers/fetch-connection-property-map')

module.exports = {
  typeDefs: `
    extend type Person {
      connections: [Connection!]!
    }
  `,
  resolvers: {
    Person: {
      connections: handleErrors(async (person, args, context) => {
        const connections = await context.store.readAll({
          type: 'connections',
          filters: { from: person.id }
        })

        const {
          roleMap,
          companyMap,
          personMap
        } = await fetchConnectionPropertyMap(context, connections)

        return sortBy(
          connections.map(connection => ({
            ...connection,
            role: roleMap[connection.role],
            company: companyMap[connection.company],
            person: personMap[connection.person]
          })),
          ['firstName', 'lastName']
        )
      })
    }
  }
}
