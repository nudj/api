const handleErrors = require('../../lib/handle-errors')

module.exports = {
  typeDefs: `
    extend type Job {
      createReferralByEmail(email: String!, parent: ID): Referral
    }
  `,
  resolvers: {
    Job: {
      createReferralByEmail: handleErrors(async (job, args, context) => {
        const {
          email,
          parent: parentId
        } = args

        if (!email) throw new Error('Email address must be provided')

        const person = await context.sql.readOneOrCreate({
          type: 'people',
          filters: { email },
          data: { email }
        })

        const parent = await context.sql.readOne({
          type: 'referrals',
          id: parentId
        })

        return context.sql.readOneOrCreate({
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
      })
    }
  }
}
