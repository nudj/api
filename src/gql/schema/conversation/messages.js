const { handleErrors } = require('../../lib')
const { fetchGmailMessages } = require('../../lib/google')
const { values: emailPreferences } = require('../enums/email-preference-types')

module.exports = {
  typeDefs: `
    type Message {
      id: ID
      body: String
      date: DateTime!
    }

    extend type Conversation {
      messages: [Message!]!
    }
  `,
  resolvers: {
    Conversation: {
      messages: handleErrors(async (conversation, args, context) => {
        switch (conversation.type) {
          case emailPreferences.GOOGLE:
            return await fetchGmailMessages({ context, conversation })
          default:
            const { recipient, person, created: date } = conversation
            return [
              {
                date,
                to: recipient,
                from: person
              }
            ]
        }
      })
    }
  }
}
