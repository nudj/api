const { omitUndefined } = require('@nudj/library')
const { values: hirerTypes } = require('../enums/hirer-types')

module.exports = {
  typeDefs: `
    extend type Job {
      referralsForHirer (
        parent: ID
      ): [Referral!]!
    }
  `,
  resolvers: {
    Job: {
      referralsForHirer: async (job, args, context) => {
        const { userId } = context
        const { parent } = args

        const hirer = await context.store.readOne({
          type: 'hirers',
          filters: {
            person: userId,
            company: job.company
          }
        })
        if (!hirer) throw new Error('User is not a hirer for this company')

        const filters = omitUndefined({
          job: job.id,
          parent
        })
        if (hirer.type === hirerTypes.MEMBER) {
          if (parent) {
            const parentReferral = await context.store.readOne({
              type: 'referrals',
              id: parent
            })
            if (!parentReferral || parentReferral.person !== userId) return []
          } else {
            filters.person = userId
          }
        }

        const referrals = await context.store.readAll({
          type: 'referrals',
          filters
        })

        if (hirer.type === hirerTypes.ADMIN && !parent) {
          return referrals.filter(referral => !referral.parent)
        }

        return referrals
      }
    }
  }
}
