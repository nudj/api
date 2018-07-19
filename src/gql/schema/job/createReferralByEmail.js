module.exports = {
  typeDefs: `
    extend type Job {
      createReferralByEmail(email: String!, parent: ID): Referral
    }
  `,
  resolvers: {
    Job: {
      createReferralByEmail: async (job, args, context) => {
        const {
          email,
          parent: parentId
        } = args

        if (!email) throw new Error('Email address must be provided')

        const person = await context.store.readOneOrCreate({
          type: 'people',
          filters: { email },
          data: { email }
        })

        const parent = await context.store.readOne({
          type: 'referrals',
          id: parentId
        })

        return context.store.readOneOrCreate({
          type: 'referrals',
          filters: {
            job: job.id,
            person: person.id
          },
          data: {
            job: job.id,
            person: person.id,
            parent: parent && parent.id
          }
        })
      }
    }
  }
}
