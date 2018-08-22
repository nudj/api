const generateHash = require('hash-generator')
const { values: hirerTypes } = require('../enums/hirer-types')
const { values: dataSources } = require('../enums/data-sources')
const { validateCompanyCreation } = require('../../lib/helpers/validation/company')
const { createCompany } = require('../../lib/helpers')
const updateIntercomTagsForHirer = require('../../lib/intercom/update-tags-for-hirer')

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
        let company = await context.sql.readOne({
          type: 'companies',
          filters: { name: companyName }
        })

        if (company) {
          const userHirer = await context.sql.readOne({
            type: 'hirers',
            filters: {
              company: company.id,
              person: person.id
            }
          })

          if (userHirer) return userHirer

          company = await context.sql.update({
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

        const currentEmployment = await context.sql.readOne({
          type: 'employments',
          filters: {
            person: person.id,
            current: true
          }
        })

        const employedWithOtherCompany = currentEmployment && currentEmployment.company !== company.id

        if (employedWithOtherCompany) {
          await context.sql.update({
            type: 'employments',
            id: currentEmployment.id,
            data: {
              current: false
            }
          })
        }

        if (!currentEmployment || employedWithOtherCompany) {
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

        const hirer = await context.sql.create({
          type: 'hirers',
          data: {
            person: person.id,
            company: company.id,
            onboarded: false,
            type: hirerTypes.ADMIN
          }
        })
        await updateIntercomTagsForHirer(context, hirer)

        return hirer
      }
    }
  }
}
