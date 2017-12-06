module.exports = {
  typeDefs: `
    extend type Mutation {
      connections: [Connection!]!
    }
  `,
  resolvers: {
    Mutation: {
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
