module.exports = {
  typeDefs: `
    extend type Mutation {
      hirers: [Hirer!]!
    }
  `,
  resolvers: {
    Mutation: {
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
