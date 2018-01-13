const { fetchGmailMessages } = require('../../lib/google')
const { values: emailPreferences } = require('../enums/email-preference-types')

module.exports = {
  typeDefs: `
    type Message {
      id: ID!
      body: String!
      date: DateTime!
      sender: Person!
      recipient: Person!
    }

    extend type Conversation {
      messages: [Message!]!
    }
  `,
  resolvers: {
    Conversation: {
      messages: async (conversation, args, context) => {
        switch (conversation.type) {
          case emailPreferences.GOOGLE:
            return await fetchGmailMessages({ context, conversation })
          default:
            return {

            }
        }
      }
    }
  }
}
