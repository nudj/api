const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')
const { handleErrors } = require('../../lib')
const { values: hirerTypes } = require('../enums/hirer-types')
const { values: dataSources } = require('../enums/data-sources')

module.exports = {
  typeDefs: `
    extend type Person {
      addCompanyAndAssignUserAsHirer(company: CompanyCreateInput!): Hirer!
    }
  `,
  resolvers: {
    Person: {
      addCompanyAndAssignUserAsHirer: handleErrors(async (person, args, context) => {
        const {
          name: companyName,
          location,
          description,
          client
        } = args.company

        // Avoid using `readOneOrCreate` to prevent unnecessarily generating a
        // slug and checking newly created companies for existing hirers.
        let company = await context.store.readOne({
          type: 'companies',
          filters: { name: companyName }
        })

        if (company) {
          if (company.client) {
            throw new Error(`${companyName} is already a company on nudj`)
          }

          const userHirer = await context.store.readOne({
            type: 'hirers',
            filters: {
              company: company.id,
              person: person.id
            }
          })

          if (userHirer) return userHirer

          company = await context.store.update({
            type: 'companies',
            id: company.id,
            data: {
              client: true
            }
          })
        } else {
          const slug = await makeUniqueSlug({
            type: 'companies',
            data: args.company,
            context
          })

          company = await context.store.create({
            type: 'companies',
            filters: { name: companyName },
            data: {
              name: companyName,
              slug,
              location,
              description,
              client,
              onboarded: false
            }
          })
        }

        const currentEmployment = await context.store.readOne({
          type: 'employments',
          filters: {
            person: person.id,
            current: true
          }
        })

        const employedWithOtherCompany = currentEmployment && currentEmployment.company !== company.id

        if (employedWithOtherCompany) {
          await context.store.update({
            type: 'employments',
            id: currentEmployment.id,
            data: {
              current: false
            }
          })
        }

        if (!currentEmployment || employedWithOtherCompany) {
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

        return context.store.create({
          type: 'hirers',
          data: {
            person: person.id,
            company: company.id,
            onboarded: false,
            type: hirerTypes.ADMIN
          }
        })
      })
    }
  }
}
