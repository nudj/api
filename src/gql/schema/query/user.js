module.exports = {
  typeDefs: `
    extend type Query {
      user: Person
    }
  `,
  resolvers: {
    Query: {
      user: (root, args, context) => context.store.readOne({
        type: 'people',
        id: context.userId
      })
    }
  }
}
