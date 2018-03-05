const { logger } = require('@nudj/library')
const intercom = require('../../lib/intercom')
const handleErrors = require('../../lib/handle-errors')

module.exports = {
  typeDefs: `
    extend type Job {
      createApplication(person: ID!, referral: ID): Application
    }
  `,
  resolvers: {
    Job: {
      createApplication: handleErrors((job, args, context) => {
        const {
          person: personId,
          referral: referralId
        } = args

        return Promise.all([
          context.store.readOne({
            type: 'people',
            id: personId
          }),
          context.store.readOne({
            type: 'referrals',
            id: referralId
          }),
          context.store.readOne({
            type: 'companies',
            id: job.company
          })
        ])
        .then(([
          person,
          referral,
          company
        ]) => {
          if (!person) throw new Error(`Person with id ${personId} does not exist`)
          return context.store.readOneOrCreate({
            type: 'applications',
            filters: {
              job: job.id,
              person: person.id
            },
            data: {
              job: job.id,
              person: person.id,
              referral: referral && referral.id
            }
          })
          .then(application => {
            return intercom.createUser({
              email: person.email,
              custom_attributes: {
                lastJobAppliedFor: `${job.title} at ${company.name}`
              }
            })
            .then(() => application)
            .catch(error => {
              logger('error', 'Intercom error', error)
              return application
            })
          })
        })
      })
    }
  }
}
