module.exports = {
  typeDefs: `
    extend type Query {
      hirers: [Hirer!]!
    }
  `,
  resolvers: {
    Query: {
      hirers: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'hirers'
          })
        })
      }
    }
  }
}
