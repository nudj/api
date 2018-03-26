const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createCompany(input: CompanyCreateInput): Company
    }
  `,
  resolvers: {
    Mutation: {
      createCompany: handleErrors((root, args, context) => {
        return context.store.create({
          type: 'companies',
          data: args.input
        })
      })
    }
  }
}
