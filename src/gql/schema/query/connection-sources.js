module.exports = {
  typeDefs: `
    extend type Query {
      connectionSources: [ConnectionSource!]!
    }
  `,
  resolvers: {
    Query: {
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
