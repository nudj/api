module.exports = {
  typeDefs: `
    extend type Job {
      incrementViewCount: Int!
    }
  `,
  resolvers: {
    Job: {
      incrementViewCount: (job, args, context) => {
        return context.transaction((store, params) => {
          const incrementedViews = params.viewCount + 1

          return store.update({
            type: 'jobs',
            id: params.id,
            data: {
              viewCount: incrementedViews
            }
          })
          .then(job => {
            return incrementedViews
          })
        }, {
          id: job.id,
          viewCount: job.viewCount
        })
      }
    }
  }
}
