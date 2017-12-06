module.exports = {
  typeDefs: `
    extend type Mutation {
      surveys: [Survey!]!
    }
  `,
  resolvers: {
    Mutation: {
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
