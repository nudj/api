module.exports = {
  typeDefs: `
    extend type Query {
      companies: [Company!]!
    }
  `,
  resolvers: {
    Query: {
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
