module.exports = {
  typeDefs: `
    extend type Query {
      personTasks: [PersonTask!]!
    }
  `,
  resolvers: {
    Query: {
      personTasks: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'personTasks'
          })
        })
      }
    }
  }
}
