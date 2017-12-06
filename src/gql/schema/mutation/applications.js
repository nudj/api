module.exports = {
  typeDefs: `
    extend type Mutation {
      applications: [Application!]!
    }
  `,
  resolvers: {
    Mutation: {
      applications: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'applications'
          })
        })
      }
    }
  }
}
