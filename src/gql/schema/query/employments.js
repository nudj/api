module.exports = {
  typeDefs: `
    extend type Query {
      employments: [Employment!]!
    }
  `,
  resolvers: {
    Query: {
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
