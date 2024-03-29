const updateIntercomTagsForHirer = require('../../lib/intercom/update-tags-for-hirer')

module.exports = {
  typeDefs: `
    extend type Company {
      createHirerByEmail(
        hirer: HirerCreateByEmailInput!
      ): Hirer
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
          onboarded = false,
          type,
          email
        } = args.hirer

        const person = await context.sql.readOneOrCreate({
          type: 'people',
          filters: { email },
          data: { email }
        })

        const hirer = await context.sql.create({
          type: 'hirers',
          data: {
            onboarded,
            type,
            person: person.id,
            company: company.id
          }
        })
        updateIntercomTagsForHirer(context, hirer)

        return hirer
      }
    }
  }
}
