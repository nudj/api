module.exports = {
  typeDefs: `
    extend type Job {
      viewCount: Int!
    }
  `,
  resolvers: {
    Job: {
      viewCount: (job, args, context) => {
        return context.store.countByFilters({
          type: 'events',
          filters: {
            entityId: job.id,
            eventType: 'viewed'
          }
        })
      }
    }
  }
}
