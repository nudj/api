const hash = require('hash-generator')

const handleErrors = require('../../lib/handle-errors')
const makeSlug = require('../../lib/helpers/make-slug')
const { enrichOrFetchEnrichedCompanyByName } = require('../../lib/clearbit')

module.exports = {
  typeDefs: `
    extend type Person {
      getOrCreateEmployment(company: String!, current: Boolean!, source: DataSource!): Employment
    }
  `,
  resolvers: {
    Person: {
      getOrCreateEmployment: handleErrors(async (person, args, context) => {
        const {
          company: newCompany,
          source,
          current
        } = args

        if (!newCompany) throw new Error('Please pass a company string')

        let companySlug = makeSlug(newCompany)
        let company = await context.sql.readOne({
          type: 'companies',
          filters: { name: newCompany }
        })

        if (!company) {
          company = await context.sql.readOne({
            type: 'companies',
            filters: {
              slug: companySlug
            }
          })

          while (company && companySlug === company.slug) {
            companySlug = `${companySlug}-${hash(8)}`
            company = await context.sql.readOne({
              type: 'companies',
              filters: {
                slug: companySlug
              }
            })
          }
        }

        const employment = company && await context.sql.readOne({
          type: 'employments',
          filters: {
            person: person.id,
            company: company.id
          }
        })

        if (employment) return { ...employment, company }

        if (!company) {
          company = await context.sql.create({
            type: 'companies',
            data: {
              name: newCompany,
              slug: companySlug,
              onboarded: false,
              client: false
            }
          })
          enrichOrFetchEnrichedCompanyByName(company, context)
        }
        const newEmployment = await context.sql.create({
          type: 'employments',
          data: {
            current,
            person: person.id,
            source: source,
            company: company.id
          }
        })

        return { ...newEmployment, company }
      })
    }
  }
}
