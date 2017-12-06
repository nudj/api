module.exports = {
  typeDefs: `
    extend type Mutation {
      connectionSources: [ConnectionSource!]!
    }
  `,
  resolvers: {
    Mutation: {
      connectionSources: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'connectionSources'
          })
        })
      }
    }
  }
}
