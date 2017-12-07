module.exports = {
  typeDefs: `
    extend type Mutation {
      recommendations: [Recommendation!]!
    }
  `,
  resolvers: {
    Mutation: {
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
