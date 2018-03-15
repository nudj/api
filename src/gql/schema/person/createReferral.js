module.exports = {
  typeDefs: `
    extend type Person {
      createReferral(job: ID!, parent: ID): Referral
    }
  `,
  resolvers: {
    Person: {
      createReferral: async (person, args, context) => {
        const { job: jobId, parent: parentId } = args
        const existingReferral = await context.store.readOne({
          type: 'referrals',
          filters: {
            person: person.id,
            job: jobId
          }
        })
        if (existingReferral) throw new Error('Already nudjed')

        const [ job, parent ] = await Promise.all([
          context.store.readOne({
            type: 'jobs',
            id: jobId
          }),
          context.store.readOne({
            type: 'referrals',
            id: parentId
          })
        ])
        if (!job) throw new Error(`Job with id ${jobId} does not exist`)

        return context.store.create({
          type: 'referrals',
          data: {
            person: person.id,
            job: job.id,
            parent: parent && parent.id
          }
        })
      }
    }
  }
}
