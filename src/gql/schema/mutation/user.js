module.exports = {
  typeDefs: `
    extend type Mutation {
      user(id: ID!): Person!
    }
  `,
  resolvers: {
    Mutation: {
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
