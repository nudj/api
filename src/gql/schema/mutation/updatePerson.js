const omit = require('lodash/omit')
const { handleErrors } = require('../../lib')
const { values: dataSources } = require('../enums/data-sources')
const getMakeUniqueCompanySlug = require('../../lib/helpers/make-unique-company-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updatePerson(id: ID!, data: PersonUpdateInput!): Person
    }
  `,
  resolvers: {
    Mutation: {
      updatePerson: handleErrors(async (root, args, context) => {
        const { id, data } = args
        const { company: companyName } = data

        if (!companyName) {
          return context.store.update({
            type: 'people',
            id,
            data: omit(data, ['company'])
          })
        }

        // Fetch company by name
        let company = await context.store.readOne({
          type: 'companies',
          filters: { name: companyName }
        })

        // If company does not exist, create it
        if (!company) {
          const allCompanies = await context.store.readAll({
            type: 'companies'
          })
          const makeSlug = getMakeUniqueCompanySlug(allCompanies)
          company = await context.store.create({
            type: 'companies',
            data: {
              name: companyName,
              onboarded: false,
              client: false,
              slug: makeSlug({ name: companyName })
            }
          })
        }

        // Fetch current employment for person
        const currentEmployment = await context.store.readOne({
          type: 'employments',
          filters: {
            person: id,
            current: true
          }
        })

        // If a current employment doesn't exist, create one. Otherwise, compare that
        // current employment to the PersonUpdateInput company.
        if (!currentEmployment) {
          await context.store.create({
            type: 'employments',
            data: {
              person: id,
              current: true,
              company: company.id,
              source: dataSources.NUDJ
            }
          })
        } else if (currentEmployment && currentEmployment.company !== company.id) {
          // If the current employment is different from the new data
          await context.store.update({
            type: 'employments',
            id: currentEmployment.id,
            data: {
              current: false
            }
          })
          await context.store.create({
            type: 'employments',
            data: {
              person: id,
              current: true,
              company: company.id,
              source: dataSources.NUDJ
            }
          })
        }

        return context.store.update({
          type: 'people',
          id,
          data: omit(data, ['company'])
        })
      })
    }
  }
}
