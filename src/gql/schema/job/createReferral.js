const { logger } = require('@nudj/library')
const intercom = require('../../lib/intercom')
const handleErrors = require('../../lib/handle-errors')

module.exports = {
  typeDefs: `
    extend type Job {
      createReferral(person: ID!, parent: ID): Referral
    }
  `,
  resolvers: {
    Job: {
      createReferral: handleErrors((job, args, context) => {
        const {
          person: personId,
          parent: parentId
        } = args

        return Promise.all([
          context.store.readOne({
            type: 'people',
            id: personId
          }),
          context.store.readOne({
            type: 'referrals',
            id: parentId
          }),
          context.store.readOne({
            type: 'companies',
            id: job.company
          })
        ])
        .then(([
          person,
          parent,
          company
        ]) => {
          if (!person) throw new Error(`Person with id ${personId} does not exist`)
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
          .then(referral => {
            return intercom.createUser({
              email: person.email,
              custom_attributes: {
                lastJobReferredFor: `${job.title} at ${company.name}`
              }
            })
            .then(() => referral)
            .catch(error => {
              logger('error', 'Intercom error', error)
              return referral
            })
          })
        })
      })
    }
  }
}
