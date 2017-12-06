module.exports = {
  typeDefs: `
    extend type Query {
      surveys: [Survey!]!
    }
  `,
  resolvers: {
    Query: {
      surveys: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'surveys'
          })
        })
      }
    }
  }
}
