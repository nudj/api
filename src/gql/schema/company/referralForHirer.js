const { values: hirerTypes } = require('../enums/hirer-types')

module.exports = {
  typeDefs: `
    extend type Company {
      referralForHirer (id: ID!): Referral
    }
  `,
  resolvers: {
    Company: {
      referralForHirer: async (company, args, context) => {
        const { id: referralId } = args
        const { userId } = context

        const referral = await context.store.readOne({
          type: 'referrals',
          id: referralId
        })
        if (!referral) return null

        const [
          hirer,
          parent
        ] = await Promise.all([
          context.store.readOne({
            type: 'hirers',
            filters: {
              person: userId
            }
          }),
          referral.parent && context.store.readOne({
            type: 'referrals',
            id: referral.parent
          })
        ])
        if (hirer.type === hirerTypes.MEMBER) {
          const userOwnsReferral = referral.person === userId
          const userOwnsParent = parent && parent.person === userId
          if (!(userOwnsReferral || userOwnsParent)) {
            return null
          }
        }

        const job = await context.store.readOne({
          type: 'jobs',
          id: referral.job
        })
        if (job.company !== company.id) return null

        return referral
      }
    }
  }
}
