const formatLinkedinConnections = require('../../lib/helpers/format-linkedin-connections')
const makeSlug = require('../../lib/helpers/make-slug')
const DataSources = require('../enums/data-sources')
const {
  TABLES,
  INDICES
} = require('../../../lib/sql')

module.exports = {
  typeDefs: `
    extend type Person {
      importLinkedinConnections(connections: [Data!]!): [Connection!]!
    }
  `,
  resolvers: {
    Person: {
      importLinkedinConnections: async (person, args, context) => {
        const { connections } = args
        const source = DataSources.values.LINKEDIN
        const from = person.id
        const formattedConnections = formatLinkedinConnections(connections)

        const peopleData = []
        const roleData = []
        const companyData = []

        formattedConnections.forEach(connection => {
          if (connection.email) {
            peopleData.push({ email: connection.email })
          }
          if (connection.title) {
            roleData.push({ name: connection.title })
          }
          if (connection.company) {
            companyData.push({
              name: connection.company,
              slug: makeSlug(connection.company)
            })
          }
        })

        console.log('roleData', roleData)

        const [
          personIds,
          roleIds,
          companyIds
        ] = await Promise.all([
          context.sql.import({
            type: TABLES.PEOPLE,
            data: peopleData,
            index: INDICES[TABLES.PEOPLE].email
          }),
          context.sql.import({
            type: TABLES.ROLES,
            data: roleData,
            index: INDICES[TABLES.ROLES].name
          }),
          context.sql.import({
            type: TABLES.COMPANIES,
            data: companyData,
            index: INDICES[TABLES.COMPANIES].name,
            slugIndex: INDICES[TABLES.COMPANIES].slug
          })
        ])

        let personPointer = 0
        let rolePointer = 0
        let companyPointer = 0
        const connectionsData = formattedConnections.map((conn, index) => {
          return ({
            from,
            source,
            person: conn.email && personIds[personPointer++],
            role: conn.title && roleIds[rolePointer++],
            company: conn.company && companyIds[companyPointer++],
            firstName: conn.firstName,
            lastName: conn.lastName
          })
        })

        const connectionIds = await context.sql.import({
          type: TABLES.CONNECTIONS,
          data: connectionsData,
          index: INDICES[TABLES.CONNECTIONS].fromperson
        })

        return connectionIds.map(id => ({ id }))
      }
    }
  }
}
