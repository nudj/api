module.exports = {
  typeDefs: `
    extend type Job {
      createReferral(person: ID!, parent: ID): Referral
    }
  `,
  resolvers: {
    Job: {
      createReferral: (job, args, context) => {
        return context.transaction((store, params) => {
          const { personId, jobId, parentReferralId } = params
          return Promise.all([
            store.readOne({
              type: 'people',
              id: personId
            }),
            store.readOne({
              type: 'referrals',
              id: parentReferralId
            })
          ])
          .then(([ person, parent ]) => {
            if (!person) throw new Error(`Person with id ${personId} does not exist`)
            return store.readOneOrCreate({
              type: 'referrals',
              filters: {
                job: jobId,
                person: person.id
              },
              data: {
                job: jobId,
                person: person.id,
                parent: parent && parent.id
              }
            })
          })
        }, {
          jobId: job.id,
          personId: args.person,
          parentReferralId: args.parent
        })
      }
    }
  }
}
