module.exports = {
  typeDefs: `
    extend type Mutation {
      employments: [Employment!]!
    }
  `,
  resolvers: {
    Mutation: {
      employments: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'employments'
          })
        })
      }
    }
  }
}
