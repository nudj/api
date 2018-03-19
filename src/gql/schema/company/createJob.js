const handleErrors = require('../../lib/handle-errors')

module.exports = {
  typeDefs: `
    extend type Company {
      createJob(data: JobCreateInput!): Job
    }
  `,
  resolvers: {
    Company: {
      createJob: handleErrors(async (company, args, context) => {
        const existingJob = await context.store.readOne({
          type: 'jobs',
          filters: {
            company: company.id,
            slug: args.data.slug
          }
        })

        if (existingJob) {
          throw new Error(`Company \`${company.name}\` already has a job with slug \`${args.data.slug}\``)
        }

        return context.store.create({
          type: 'jobs',
          data: {
            ...args.data,
            company: company.id
          }
        })
      })
    }
  }
}
