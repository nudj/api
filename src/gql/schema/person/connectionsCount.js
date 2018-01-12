module.exports = {
  typeDefs: `
    extend type Person {
      connectionsCount: Int!
    }
  `,
  resolvers: {
    Person: {
      connectionsCount: ({ id }, args, context) => {
        return context.transaction((store, params) => {
          return store.readAll({
            type: 'connections',
            filters: { from: params.id }
          }).then(connections => Promise.resolve(connections.length))
        }, {
          id
        })
      }
    }
  }
}
