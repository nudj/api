const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')
const { handleErrors } = require('../../lib')
const { values: hirerTypes } = require('../enums/hirer-types')

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
          const userHirer = await context.store.readOne({
            type: 'hirers',
            filters: {
              company: company.id,
              person: person.id
            }
          })

          if (userHirer) return userHirer
          throw new Error(`${companyName} is already a company on nudj`)
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