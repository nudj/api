module.exports = {
  typeDefs: `
    extend type Person {
      searchConnections: [Connection!]!
    }
  `,
  resolvers: {
    Person: {
      searchConnections: (person, args, context) => {
        const { query, fields } = args
        return context.transaction((store, params) => {
          const { from } = params
          return store.search({
            type: 'connections',
            query: params.query,
            fields: params.fields,
            filters: { from }
          })
        }, {
          query,
          fields,
          from: person.id
        })
      }
    }
  }
}
