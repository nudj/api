const omit = require('lodash/omit')
const { handleErrors } = require('../../lib')
const { values: dataSources } = require('../enums/data-sources')
const getMakeUniqueCompanySlug = require('../../lib/helpers/make-unique-company-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createPerson(input: PersonCreateInput): Person
    }
  `,
  resolvers: {
    Mutation: {
      createPerson: handleErrors(async (root, args, context) => {
        const { company: companyName } = args.input

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
              slug: makeSlug({ name: companyName })
            }
          })
        }

        const person = await context.store.create({
          type: 'people',
          data: omit(args.input, ['company'])
        })

        await context.store.create({
          type: 'employments',
          data: {
            person: person.id,
            company: company.id,
            current: true,
            source: dataSources.NUDJ
          }
        })

        return person
      })
    }
  }
}
