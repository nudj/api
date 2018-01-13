const { fetchGmailThreadMessages } = require('../../lib/google')
const { values: emailPreferences } = require('../enums/email-preference-types')

module.exports = {
  typeDefs: `
    type Message {
      subject: String
      body: String
      date: DateTime
      sender: Person
      recipient: Person
    }

    extend type Conversation {
      messages: [Data!]!
    }
  `,
  resolvers: {
    Conversation: {
      messages: async (conversation, args, context) => {
        switch (conversation.type) {
          case emailPreferences.GOOGLE:
            return await fetchGmailThreadMessages({ context, conversation })
          default:
            return {

            }
        }
      }
    }
  }
}
