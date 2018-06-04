const createJob = require('../../lib/helpers/create-job')
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
        return createJob(context, company, args.data)
      })
    }
  }
}
