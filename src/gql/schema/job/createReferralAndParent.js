const { logger } = require('@nudj/library')
const intercom = require('../../lib/intercom')
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
          parentPerson,
          company
        ] = await Promise.all([
          context.store.readOne({
            type: 'people',
            id: personId
          }),
          context.store.readOne({
            type: 'people',
            id: parentPersonId
          }),
          context.store.readOne({
            type: 'companies',
            id: job.company
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

        referral = await context.store.create({
          type: 'referrals',
          data: {
            job: job.id,
            person: person.id,
            parent: parent && parent.id
          }
        })

        try {
          await Promise.all([
            intercom.createUser({
              email: person.email,
              custom_attributes: {
                lastJobReferredFor: `${job.title} at ${company.name}`
              }
            }),
            intercom.logEvent({
              event_name: 'new-referral',
              email: person.email,
              metadata: {
                jobTitle: job.title,
                company: company.name
              }
            })
          ])
        } catch (error) {
          logger('error', 'Intercom error', error)
        }

        return referral
      })
    }
  }
}
