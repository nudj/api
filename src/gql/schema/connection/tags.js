module.exports = {
  typeDefs: `
    extend type Connection {
      tags: [Tag!]
    }
  `,
  resolvers: {
    Connection: {
      tags: async (connection, args, context) => {
        return connection.tags || null
      }
    }
  }
}
