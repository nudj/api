const createJob = require('../../lib/helpers/create-job')

module.exports = {
  typeDefs: `
    extend type Company {
      createJobAndOnboardHirer(data: JobCreateInput!): Job
    }
  `,
  resolvers: {
    Company: {
      createJobAndOnboardHirer: async (company, args, context) => {
        const job = await createJob(context, company, args.data)

        // Set hirer as onboarded
        const hirer = await context.store.readOne({
          type: 'hirers',
          filters: { person: context.userId }
        })
        await context.store.update({
          type: 'hirers',
          id: hirer.id,
          data: {
            onboarded: true
          }
        })

        return job
      }
    }
  }
}
