const {
  TABLES,
  SLUG_GENERATORS
} = require('../../../lib/sql')

module.exports = {
  typeDefs: `
    extend type Job {
      getOrCreateReferralForUser(person: ID!, parent: ID): Referral
    }
  `,
  resolvers: {
    Job: {
      getOrCreateReferralForUser: async (job, args, context) => {
        const {
          person: personId,
          parent: parentId
        } = args

        const [
          person,
          parent
        ] = await Promise.all([
          context.sql.readOne({
            type: 'people',
            id: personId
          }),
          context.sql.readOne({
            type: 'referrals',
            id: parentId
          })
        ])

        if (!person) throw new Error(`Person with id ${personId} does not exist`)

        const slug = SLUG_GENERATORS[TABLES.REFERRALS].generator()
        const referral = await context.sql.readOneOrCreate({
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

        return referral
      }
    }
  }
}
