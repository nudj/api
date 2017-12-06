module.exports = {
  typeDefs: `
    extend type Query {
      people: [Person!]!
    }
  `,
  resolvers: {
    Query: {
      people: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'people'
          })
        })
      }
    }
  }
}
