const { handleErrors } = require('../../lib')

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

        return context.store.create({
          type: 'companies',
          data: { ...args.company, onboarded, client }
        })
      })
    }
  }
}
