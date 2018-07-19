module.exports = {
  typeDefs: `
    extend type Mutation {
      user: Person
    }
  `,
  resolvers: {
    Mutation: {
      user: (root, args, context) => context.store.readOne({
        type: 'people',
        id: context.userId
      })
    }
  }
}
