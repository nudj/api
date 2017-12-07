module.exports = {
  typeDefs: `
    extend type Mutation {
      personTasks: [PersonTask!]!
    }
  `,
  resolvers: {
    Mutation: {
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
