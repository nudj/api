module.exports = {
  typeDefs: `
    extend type Query {
      jobs: [Job!]!
    }
  `,
  resolvers: {
    Query: {
      jobs: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'jobs'
          })
        })
      }
    }
  }
}
