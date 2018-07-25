module.exports = {
  typeDefs: `
    extend type Mutation {
      createMessageEvent(
        hash: String!
      ): MessageEvent
    }
  `,
  resolvers: {
    Mutation: {
      createMessageEvent: async (root, args, context) => {
        return context.store.create({
          type: 'messageEvents',
          data: {
            hash: args.hash
          }
        })
      }
    }
  }
}
