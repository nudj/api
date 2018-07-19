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
          context.store.readOne({
            type: 'people',
            id: personId
          }),
          context.store.readOne({
            type: 'referrals',
            id: parentId
          })
        ])

        if (!person) throw new Error(`Person with id ${personId} does not exist`)

        const referral = await context.store.readOneOrCreate({
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

        return referral
      }
    }
  }
}
