module.exports = {
  typeDefs: `
    extend type Company {
      deleteHirer(id: ID!): Hirer
    }
  `,
  resolvers: {
    Company: {
      deleteHirer: async (company, args, context) => context.store.delete({
        type: 'hirers',
        id: args.id
      })
    }
  }
}
