const handleErrors = require('../../lib/handle-errors')

module.exports = {
  typeDefs: `
    extend type Job {
      createReferralAndParent(person: ID!, parentPerson: ID!): Referral
    }
  `,
  resolvers: {
    Job: {
      createReferralAndParent: handleErrors(async (job, args, context) => {
        const {
          person: personId,
          parentPerson: parentPersonId
        } = args

        const [
          person,
          parentPerson
        ] = await Promise.all([
          context.store.readOne({
            type: 'people',
            id: personId
          }),
          context.store.readOne({
            type: 'people',
            id: parentPersonId
          })
        ])

        if (!person) throw new Error(`Person with id ${personId} does not exist`)
        if (!parentPerson) throw new Error(`Parent person with id ${parentPersonId} does not exist`)

        let referral = await context.store.readOne({
          type: 'referrals',
          filters: {
            job: job.id,
            person: person.id
          }
        })

        if (referral) return referral

        const parent = await context.store.readOneOrCreate({
          type: 'referrals',
          filters: {
            job: job.id,
            person: parentPersonId
          },
          data: {
            job: job.id,
            person: parentPersonId
          }
        })

        return context.store.create({
          type: 'referrals',
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
