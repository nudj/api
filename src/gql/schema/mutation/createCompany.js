const { handleErrors } = require('../../lib')
const { enrichOrFetchEnrichedCompanyByName } = require('../../lib/clearbit')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createCompany(company: CompanyCreateInput): Company
    }
  `,
  resolvers: {
    Mutation: {
      createCompany: handleErrors(async (root, args, context) => {
        const {
          slug,
          onboarded = false,
          client = false
        } = args.company

        const existingCompany = await context.store.readOne({
          type: 'companies',
          filters: { slug }
        })

        if (existingCompany) {
          throw new Error(`Company with slug '${slug}' already exists`)
        }

        const company = await context.store.create({
          type: 'companies',
          data: { ...args.company, onboarded, client }
        })
        enrichOrFetchEnrichedCompanyByName(company.name, context)

        return company
      })
    }
  }
}
