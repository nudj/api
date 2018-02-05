module.exports = {
  typeDefs: `
    extend type Person {
      connectionsCount: Int!
    }
  `,
  resolvers: {
    Person: {
      connectionsCount: (person, args, context) => {
        return context.store.readAll({
          type: 'connections',
          filters: { from: person.id }
        })
        .then(connections => Promise.resolve(connections.length))
      }
    }
  }
}
