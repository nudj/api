module.exports = {
  typeDefs: `
    extend type Query {
      roles: [Role!]!
    }
  `,
  resolvers: {
    Query: {
      roles: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'roles'
          })
        })
      }
    }
  }
}
