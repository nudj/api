module.exports = {
  typeDefs: `
    extend type Job {
      viewCount: Int!
    }
  `,
  resolvers: {
    Job: {
      viewCount: (job, args, context) => job.viewCount || 0
    }
  }
}
