module.exports = {
  typeDef: `
    extend type Query {
      hirers: [Hirer!]!
    }
    extend type Mutation {
      hirers: [Hirer!]!
    }
  `,
  resolver: (root, args, context) => {
    return context.transaction((store) => {
      return store.readAll({
        type: 'hirers'
      })
    })
  }
}
