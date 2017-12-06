module.exports = {
  typeDefs: `
    extend type Mutation {
      people: [Person!]!
    }
  `,
  resolvers: {
    Mutation: {
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
