module.exports = {
  typeDefs: `
    extend type Company {
      referral (id: ID!): Referral
    }
  `,
  resolvers: {
    Company: {
      referral: async (company, args, context) => {
        const { id: referralId } = args

        const referral = await context.sql.readOne({
          type: 'referrals',
          id: referralId
        })
        if (!referral) return null

        const job = await context.sql.readOne({
          type: 'jobs',
          id: referral.job
        })
        if (job.company !== company.id) return null

        return referral
      }
    }
  }
}
