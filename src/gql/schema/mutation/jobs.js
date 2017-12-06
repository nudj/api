module.exports = {
  typeDefs: `
    extend type Mutation {
      jobs: [Job!]!
    }
  `,
  resolvers: {
    Mutation: {
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
