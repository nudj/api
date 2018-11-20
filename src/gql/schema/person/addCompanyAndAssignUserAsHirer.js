const generateHash = require('hash-generator')
const mapValues = require('lodash/mapValues')

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
        const companyArgs = mapValues(args.company, value => value.trim ? value.trim() : value)
        await validateCompanyCreation(companyArgs, context)

        // Avoid using `readOneOrCreate` to prevent unnecessarily generating a
        // slug and checking newly created companies for existing hirers.
        let company = await context.sql.readOne({
          type: 'companies',
          filters: { name: companyArgs.name }
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
          company = await createCompany(context, companyArgs, {
            createDummyData: true
          })
        }

        const [
          employment,
          currentEmployment
        ] = await Promise.all([
          context.sql.readOneOrCreate({
            type: 'employments',
            filters: {
              person: person.id,
              company: company.id
            },
            data: {
              person: person.id,
              company: company.id,
              source: dataSources.NUDJ
            }
          }),
          context.sql.readOne({
            type: 'currentEmployments',
            filters: {
              person: person.id
            }
          })
        ])

        if (currentEmployment) {
          const currentlyEmployedWithOtherCompany = currentEmployment && currentEmployment.company !== company.id

          if (currentlyEmployedWithOtherCompany) {
            await context.sql.update({
              type: 'currentEmployments',
              id: currentEmployment.id,
              data: {
                employment: employment.id
              }
            })
          }
        } else {
          await context.sql.create({
            type: 'currentEmployments',
            data: {
              person: person.id,
              employment: employment.id
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
