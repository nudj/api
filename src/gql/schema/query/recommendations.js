module.exports = {
  typeDefs: `
    extend type Query {
      recommendations: [Recommendation!]!
    }
  `,
  resolvers: {
    Query: {
      recommendations: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'recommendations'
          })
        })
      }
    }
  }
}
