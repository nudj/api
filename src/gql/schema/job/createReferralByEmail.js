const {
  TABLES,
  SLUG_GENERATORS
} = require('../../../lib/sql')

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

        const person = await context.sql.readOneOrCreate({
          type: 'people',
          filters: { email },
          data: { email }
        })

        const parent = await context.sql.readOne({
          type: 'referrals',
          id: parentId
        })

        const slug = SLUG_GENERATORS[TABLES.REFERRALS].generator()
        return context.sql.readOneOrCreate({
          type: 'referrals',
          filters: {
            job: job.id,
            person: person.id
          },
          data: {
            slug,
            job: job.id,
            person: person.id,
            parent: parent && parent.id
          }
        })
      }
    }
  }
}
