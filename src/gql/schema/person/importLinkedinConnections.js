const formatLinkedinConnections = require('../../lib/helpers/format-linkedin-connections')
const { handleErrors } = require('../../lib')
const { generateId } = require('@nudj/library')
const { idTypes } = require('@nudj/library/constants')
const DataSources = require('../enums/data-sources')

module.exports = {
  typeDefs: `
    extend type Person {
      importLinkedinConnections(connections: [Data!]!): [ImportLog!]!
    }
  `,
  resolvers: {
    Person: {
      importLinkedinConnections: handleErrors(async (person, args, context) => {
        const { connections } = args
        const source = DataSources.values.LINKEDIN
        const formattedConnections = formatLinkedinConnections(connections)
        const from = person.id

        const formattedData = formattedConnections.reduce((all, connection) => {
          const { email, company, title, firstName, lastName } = connection
          const personId = generateId(idTypes.PERSON, { email })
          const companyId = company ? generateId(idTypes.COMPANY, { name: company }) : null
          const roleId = title ? generateId(idTypes.ROLE, { name: title }) : null

          const connectionData = {
            from,
            source,
            firstName,
            lastName,
            person: personId,
            role: roleId,
            company: companyId
          }

          const connectionId = generateId(idTypes.CONNECTION, connectionData)

          return {
            companies: all.companies.concat({
              id: companyId,
              name: connection.company,
              client: false
            }),
            roles: all.roles.concat({
              id: roleId,
              name: connection.title
            }),
            people: all.people.concat({
              id: personId,
              email: connection.email
            }),
            connections: all.connections.concat({
              ...connectionData,
              id: connectionId
            })
          }
        }, {
          companies: [],
          roles: [],
          people: [],
          connections: []
        })

        const data = [
          {
            name: 'connections',
            data: formattedData.connections,
            onDuplicate: 'update'
          },
          {
            name: 'companies',
            data: formattedData.companies,
            onDuplicate: 'update'
          },
          {
            name: 'roles',
            data: formattedData.roles,
            onDuplicate: 'update'
          },
          {
            name: 'people',
            data: formattedData.people
          }
        ]

        return context.store.import({ data })
      })
    }
  }
}
