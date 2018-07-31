const { validateCompanyCreation } = require('../../lib/helpers/validation/company')
const { createCompany } = require('../../lib/helpers')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createCompany(company: CompanyCreateInput!): Company
    }
  `,
  resolvers: {
    Mutation: {
      createCompany: async (root, args, context) => {
        await validateCompanyCreation(args.company, context)

        return createCompany(context, args.company)
      }
    }
  }
}
