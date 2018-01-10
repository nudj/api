module.exports = {
  typeDefs: `
    extend type Person {
      createReferral(job: ID!, parent: ID): Referral
    }
  `,
  resolvers: {
    Person: {
      createReferral: (person, args, context) => {
        console.log(person, args)
        return context.transaction((store, params) => {
          const AlreadyNudjedError = new Error('Already nudjed')
          const { personId, jobId, parentReferralId } = params
          return store.readOne({
            type: 'referrals',
            filters: {
              person: personId,
              job: jobId
            }
          })
          .then(existingReferral => {
            if (existingReferral) throw AlreadyNudjedError
            return Promise.all([
              store.readOne({
                type: 'jobs',
                id: jobId
              }),
              store.readOne({
                type: 'referrals',
                id: parentReferralId
              })
            ])
            .then(([ job, parent ]) => {
              if (!job) throw new Error(`Job with id ${jobId} does not exist`)
              return store.create({
                type: 'referrals',
                data: {
                  person: personId,
                  job: job.id,
                  parent: parent && parent.id
                }
              })
            })
          })
        }, {
          personId: person.id,
          jobId: args.job,
          parentReferralId: args.parent
        })
      }
    }
  }
}
