const omit = require('lodash/omit')
const generateHash = require('hash-generator')

const { values: dataSources } = require('../enums/data-sources')
const { enrichOrFetchEnrichedCompanyByName } = require('../../lib/clearbit')
const getMakeUniqueCompanySlug = require('../../lib/helpers/make-unique-company-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createPerson(input: PersonCreateInput): Person
    }
  `,
  resolvers: {
    Mutation: {
      createPerson: async (root, args, context) => {
        const { company: companyName, role: roleName } = args.input

        const person = await context.store.create({
          type: 'people',
          data: omit(args.input, ['company', 'role'])
        })

        if (companyName) {
          let company = await context.store.readOne({
            type: 'companies',
            filters: { name: companyName }
          })

          if (!company) {
            const allCompanies = await context.store.readAll({
              type: 'companies'
            })
            const makeSlug = getMakeUniqueCompanySlug(allCompanies)
            company = await context.store.create({
              type: 'companies',
              data: {
                name: companyName,
                hash: generateHash(128),
                slug: makeSlug({ name: companyName })
              }
            })
            enrichOrFetchEnrichedCompanyByName(company, context)
          }

          await context.store.create({
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
          const role = await context.store.readOneOrCreate({
            type: 'roles',
            filters: { name: roleName },
            data: { name: roleName }
          })

          await context.store.create({
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
