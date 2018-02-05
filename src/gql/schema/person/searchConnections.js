module.exports = {
  typeDefs: `
    extend type Person {
      searchConnections(query: String!, fields: [[String!]!]!): [Connection!]!
    }
  `,
  resolvers: {
    Person: {
      searchConnections: (person, args, context) => {
        const { query, fields } = args
        return context.store.search({
          type: 'connections',
          query,
          fields,
          filters: { from: person.id }
        })
      }
    }
  }
}
