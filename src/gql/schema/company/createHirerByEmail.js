const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Company {
      createHirerByEmail(hirer: HirerCreateInput!): Hirer
    }
  `,
  resolvers: {
    Company: {
      createHirerByEmail: handleErrors(async (company, args, context) => {
        const {
          email,
          onboarded = false
        } = args.hirer

        const person = await context.store.readOneOrCreate({
          type: 'people',
          filters: { email },
          data: { email }
        })

        return context.store.create({
          type: 'hirers',
          data: {
            onboarded,
            person: person.id,
            company: company.id
          }
        })
      })
    }
  }
}
