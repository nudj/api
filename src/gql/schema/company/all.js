module.exports = {
  typeDef: `
    extend type Query {
      companies: [Company!]!
    }
    extend type Mutation {
      companies: [Company!]!
    }
  `,
  resolver: (root, args, context) => {
    return context.transaction((store) => {
      return store.readAll({
        type: 'companies'
      })
    })
  }
}
