const { merge } = require('@nudj/library')
const uniqBy = require('lodash/uniqBy')

module.exports = {
  typeDefs: `
    extend type Job {
      viewCountByFilters(filters: DateRange): Int!
    }
  `,
  resolvers: {
    Job: {
      viewCountByFilters: async (job, args, context) => {
        const allJobViews = await context.sql.readAll({
          type: 'jobViewEvents',
          filters: merge(args.filters, {
            job: job.id
          })
        })
        return uniqBy(allJobViews, 'browserId').length
      }
    }
  }
}
