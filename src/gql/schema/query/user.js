module.exports = {
  typeDefs: `
    extend type Query {
      user(id: ID!): Person!
    }
  `,
  resolvers: {
    Query: {
      user: (root, args, context) => {
        return context.transaction((store, params) => {
          return store.readOne({
            type: 'people',
            id: params.id
          })
        }, {
          id: args.id
        })
      }
    }
  }
}
