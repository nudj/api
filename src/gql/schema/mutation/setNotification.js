module.exports = {
  typeDefs: `
    extend type Mutation {
      setNotification(type: String!, message: String!): Notification
    }
  `,
  resolvers: {
    Mutation: {
      setNotification: (root, args) => {
        return {
          type: args.type,
          message: args.message
        }
      }
    }
  }
}
