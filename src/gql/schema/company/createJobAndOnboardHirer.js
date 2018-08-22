const createJob = require('../../lib/helpers/create-job')
const updateIntercomTagsForHirer = require('../../lib/intercom/update-tags-for-hirer')

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
        const hirer = await context.sql.readOne({
          type: 'hirers',
          filters: { person: context.userId }
        })
        await context.sql.update({
          type: 'hirers',
          id: hirer.id,
          data: {
            onboarded: true
          }
        })
        await updateIntercomTagsForHirer(context, hirer)

        return job
      }
    }
  }
}
