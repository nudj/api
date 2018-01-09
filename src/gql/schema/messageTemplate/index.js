module.exports = {
  typeDefs: `
    type MessageTemplate {
      subject: String!
      message: String!
      tags: [String]
    }
  `
}
