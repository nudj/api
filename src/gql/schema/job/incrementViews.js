module.exports = {
  typeDefs: `
    extend type Job {
      incrementViews: Int!
    }
  `,
  resolvers: {
    Job: {
      incrementViews: (job, args, context) => {
        return context.transaction((store, params) => {
          return store.readOne({
            type: 'jobs',
            id: params.id
          }).then(({ views }) => {
            const incrementedViews = views + 1

            return store.update({
              type: 'jobs',
              id: params.id,
              data: {
                views: incrementedViews
              }
            })
            .then(job => {
              return incrementedViews
            })
          })
        }, {
          id: job.id
        })
      }
    }
  }
}
