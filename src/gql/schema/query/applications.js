module.exports = {
  typeDefs: `
    extend type Query {
      applications: [Application!]!
    }
  `,
  resolvers: {
    Query: {
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