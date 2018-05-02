const handleErrors = require('../../lib/handle-errors')
const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Job {
      createReferralWithParentForPerson(person: ID!, parentPerson: ID!): Referral
    }
  `,
  resolvers: {
    Job: {
      createReferralWithParentForPerson: handleErrors(async (job, args, context) => {
        const {
          person: personId,
          parentPerson: parentPersonId
        } = args

        const [
          person,
          parentPerson
        ] = await Promise.all([
          context.sql.readOne({
            type: 'people',
            id: personId
          }),
          context.sql.readOne({
            type: 'people',
            id: parentPersonId
          })
        ])

        if (!person) throw new Error(`Person with id ${personId} does not exist`)
        if (!parentPerson) throw new Error(`Parent person with id ${parentPersonId} does not exist`)

        let referral = await context.sql.readOne({
          type: 'referrals',
          filters: {
            job: job.id,
            person: person.id
          }
        })

        if (referral) return referral

        const parentSlug = await makeUniqueSlug({
          type: 'referrals',
          context
        })

        const parent = await context.sql.readOneOrCreate({
          type: 'referrals',
          filters: {
            job: job.id,
            person: parentPersonId
          },
          data: {
            job: job.id,
            person: parentPersonId,
            slug: parentSlug
          }
        })

        const slug = await makeUniqueSlug({
          type: 'referrals',
          context
        })

        return context.sql.create({
          type: 'referrals',
          data: {
            job: job.id,
            person: person.id,
            parent: parent && parent.id,
            slug
          }
        })
      })
    }
  }
}
