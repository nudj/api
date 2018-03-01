const fetchConnectionPropertyMap = require('../../lib/helpers/fetch-connection-property-map')

module.exports = {
  typeDefs: `
    extend type Person {
      searchConnections(query: String!, fields: [[String!]!]!): [Connection!]!
    }
  `,
  resolvers: {
    Person: {
      searchConnections: async (person, args, context) => {
        const { query, fields } = args
        const connections = await context.store.search({
          type: 'connections',
          query,
          fields,
          filters: { from: person.id }
        })

        const {
          roleMap,
          companyMap,
          personMap
        } = await fetchConnectionPropertyMap(context, connections)

        return connections.map(connection => ({
          ...connection,
          role: roleMap[connection.role],
          company: companyMap[connection.company],
          person: personMap[connection.person]
        }))
      }
    }
  }
}
