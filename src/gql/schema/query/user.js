module.exports = {
  typeDefs: `
    extend type Query {
      user: Person
    }
  `,
  resolvers: {
    Query: {
      user: (root, args, context) => context.sql.readOne({
        type: 'people',
        id: context.userId
      })
    }
  }
}
