module.exports = {
  typeDefs: `
    extend type Mutation {
      roles: [Role!]!
    }
  `,
  resolvers: {
    Mutation: {
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
