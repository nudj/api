module.exports = {
  typeDefs: `
    extend type Mutation {
      companies: [Company!]!
    }
  `,
  resolvers: {
    Mutation: {
      companies: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'companies'
          })
        })
      }
    }
  }
}
