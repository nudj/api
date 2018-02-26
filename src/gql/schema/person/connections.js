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
          personMap,
          sourceMap
        } = await fetchConnectionPropertyMap(context, connections)

        return connections.map(connection => ({
          ...connection,
          role: roleMap[connection.role],
          company: companyMap[connection.company],
          person: personMap[connection.person],
          source: sourceMap[connection.source]
        }))
      })
    }
  }
}
