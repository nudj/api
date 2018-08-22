const generateHash = require('hash-generator')

const { values: hirerTypes } = require('../enums/hirer-types')
const { values: dataSources } = require('../enums/data-sources')
const { validateCompanyCreation } = require('../../lib/helpers/validation/company')
const { createCompany } = require('../../lib/helpers')

module.exports = {
  typeDefs: `
    extend type Person {
      addCompanyAndAssignUserAsHirer(company: CompanyCreateInput!): Hirer!
    }
  `,
  resolvers: {
    Person: {
      addCompanyAndAssignUserAsHirer: async (person, args, context) => {
        await validateCompanyCreation(args.company, context)
        const companyName = args.company.name

        // Avoid using `readOneOrCreate` to prevent unnecessarily generating a
        // slug and checking newly created companies for existing hirers.
        let company = await context.store.readOne({
          type: 'companies',
          filters: { name: companyName }
        })

        if (company) {
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
              client: true,
              hash: generateHash(128)
            }
          })
        } else {
          company = await createCompany(context, args.company, {
            createDummyData: true
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
      }
    }
  }
}
