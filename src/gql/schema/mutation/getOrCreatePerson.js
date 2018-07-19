const omit = require('lodash/omit')
const { values: dataSources } = require('../enums/data-sources')
const { enrichOrFetchEnrichedCompanyByName } = require('../../lib/clearbit')
const getMakeUniqueCompanySlug = require('../../lib/helpers/make-unique-company-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      getOrCreatePerson(person: PersonCreateInput!): Person
    }
  `,
  resolvers: {
    Mutation: {
      getOrCreatePerson: async (root, args, context) => {
        const {
          company: companyName,
          role: roleName,
          email
        } = args.person

        let existingPerson = await context.sql.readOne({
          type: 'people',
          filters: { email }
        })

        if (existingPerson) return existingPerson

        const person = await context.sql.create({
          type: 'people',
          data: omit(args.person, ['company', 'role'])
        })

        if (companyName) {
          let company = await context.sql.readOne({
            type: 'companies',
            filters: { name: companyName }
          })

          if (!company) {
            const allCompanies = await context.sql.readAll({
              type: 'companies'
            })
            const makeSlug = getMakeUniqueCompanySlug(allCompanies)
            company = await context.sql.create({
              type: 'companies',
              data: {
                name: companyName,
                slug: makeSlug({ name: companyName })
              }
            })
            enrichOrFetchEnrichedCompanyByName(company, context)
          }

          await context.sql.create({
            type: 'employments',
            data: {
              person: person.id,
              company: company.id,
              current: true,
              source: dataSources.NUDJ
            }
          })
        }

        if (roleName) {
          const role = await context.sql.readOneOrCreate({
            type: 'roles',
            filters: { name: roleName },
            data: { name: roleName }
          })

          await context.sql.create({
            type: 'personRoles',
            data: {
              person: person.id,
              role: role.id,
              current: true,
              source: dataSources.NUDJ
            }
          })
        }

        return person
      }
    }
  }
}
