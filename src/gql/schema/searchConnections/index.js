module.exports = {
  typeDefs: `
    extend type Query {
      searchConnections: [Connection!]!
    }
  `,
  resolvers: {
    Query: {
      searchConnections: (root, args, context) => {
        const { query, fields } = args
        return context.transaction((store, params) => {
          return store.search({
            type: 'connections',
            query: params.query,
            fields: params.fields
          })
        }, {
          query,
          fields
        })
      }
    }
  }
}
