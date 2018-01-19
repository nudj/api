const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      setNotification(type: String!, message: String!): Notification
    }
  `,
  resolvers: {
    Mutation: {
      setNotification: handleErrors((root, args) => {
        return {
          type: args.type,
          message: args.message
        }
      })
    }
  }
}
