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
        return context.transaction((store, params) => {
          const { personId, jobId, referralId } = params
          return Promise.all([
            store.readOne({
              type: 'people',
              id: personId
            }),
            store.readOne({
              type: 'referrals',
              id: referralId
            })
          ])
          .then(([ person, referral ]) => {
            if (!person) throw new Error(`Person with id ${personId} does not exist`)
            return store.readOneOrCreate({
              type: 'applications',
              filters: {
                job: jobId,
                person: person.id
              },
              data: {
                job: jobId,
                person: person.id,
                referral: referral && referral.id
              }
            })
          })
        }, {
          jobId: job.id,
          personId: args.person,
          referralId: args.referral
        })
      })
    }
  }
}
