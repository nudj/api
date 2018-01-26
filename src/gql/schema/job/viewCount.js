const isNil = require('lodash/isNil')

module.exports = {
  typeDefs: `
    extend type Job {
      viewCount: Int!
    }
  `,
  resolvers: {
    Job: {
      viewCount: (job, args, context) => {
        return isNil(job.viewCount)
          ? 0
          : job.viewCount
      }
    }
  }
}
