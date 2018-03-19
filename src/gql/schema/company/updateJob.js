const handleErrors = require('../../lib/handle-errors')

module.exports = {
  typeDefs: `
    extend type Company {
      updateJob(id: ID!, data: JobUpdateInput!): Job
    }
  `,
  resolvers: {
    Company: {
      updateJob: handleErrors(async (company, args, context) => {
        const { id, data } = args

        if (args.data.slug) {
          const existingJob = await context.store.readOne({
            type: 'jobs',
            filters: {
              company: company.id,
              slug: args.data.slug
            }
          })

          if (existingJob && id !== existingJob.id) {
            throw new Error(`Company \`${company.name}\` already has a job with slug \`${args.data.slug}\``)
          }
        }

        return context.store.update({
          type: 'jobs',
          id,
          data
        })
      })
    }
  }
}
