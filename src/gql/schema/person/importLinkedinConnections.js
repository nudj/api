const { generateId } = require('@nudj/library')
const { idTypes } = require('@nudj/library/constants')

const { enrichOrFetchEnrichedCompanyByName } = require('../../lib/clearbit')
const formatLinkedinConnections = require('../../lib/helpers/format-linkedin-connections')
const getMakeUnqiueCompanySlug = require('../../lib/helpers/make-unique-company-slug')
const { handleErrors } = require('../../lib')
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

        const companies = await context.store.query(`
          FOR company IN companies
            RETURN { slug: company.slug, id: company._key }
        `)

        const companyMap = companies.reduce((map, item) => {
          map[item.id] = item
          return map
        }, {})

        const makeUniqueCompanySlug = getMakeUnqiueCompanySlug(companyMap)

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
          const rawCompany = {
            id: companyId,
            name: company,
            onboarded: false,
            client: false
          }

          const companySlug = makeUniqueCompanySlug(rawCompany)

          return {
            companies: companyId ? all.companies.concat({
              id: companyId,
              name: connection.company,
              slug: companySlug,
              onboarded: false,
              client: false
            }) : all.companies,
            roles: roleId ? all.roles.concat({
              id: roleId,
              name: connection.title
            }) : all.roles,
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
            data: formattedData.companies
          },
          {
            name: 'roles',
            data: formattedData.roles
          },
          {
            name: 'people',
            data: formattedData.people
          }
        ]

        const result = await context.store.import({ data })
        Promise.all(formattedData.companies.map(company => {
          return enrichOrFetchEnrichedCompanyByName(company.name, context)
        }))

        return result
      })
    }
  }
}
