module.exports = {
  typeDefs: `
    extend type Query {
      connections: [Connection!]!
    }
  `,
  resolvers: {
    Query: {
      connections: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'connections'
          })
        })
      }
    }
  }
}
