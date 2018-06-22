module.exports = {
  typeDefs: `
    extend type Hirer {
      updateType(type: HirerType!): Hirer
    }
  `,
  resolvers: {
    Hirer: {
      updateType: async (hirer, args, context) => {
        return context.sql.update({
          type: 'hirers',
          id: hirer.id,
          data: {
            type: args.type
          }
        })
      }
    }
  }
}
