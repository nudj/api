module.exports = {
  typeDefs: `
    extend type Company {
      createHirerByEmail(hirer: HirerCreateByEmailInput!): Hirer
    }

    input HirerCreateByEmailInput {
      email: String!
      type: HirerType!
      onboarded: Boolean
    }
  `,
  resolvers: {
    Company: {
      createHirerByEmail: async (company, args, context) => {
        const {
          email,
          onboarded = false,
          type
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
            type,
            person: person.id,
            company: company.id
          }
        })
      }
    }
  }
}
