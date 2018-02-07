const { merge } = require('@nudj/library')

module.exports = {
  typeDefs: `
    extend type Job {
      viewCountByFilters(filters: DateRange): Int!
    }
  `,
  resolvers: {
    Job: {
      viewCountByFilters: (job, args, context) => {
        const filters = merge(args.filters, {
          entityId: job.id,
          eventType: 'viewed'
        })
        return context.store.countByFilters({
          type: 'events',
          filters
        })
      }
    }
  }
}
