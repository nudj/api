const { sendGmailByThread } = require('../../lib/google')
const { values: emailPreferences } = require('../enums/email-preference-types')
const fetchPerson = require('../../lib/helpers/fetch-person')

module.exports = {
  typeDefs: `
    extend type Conversation {
      sendMessage(body: String): Message!
    }
  `,
  resolvers: {
    Conversation: {
      sendMessage: async (conversation, args, context) => {
        const { body } = args
        const { type } = conversation

        if (!body) throw new Error('No message body')
        switch (type) {
          case emailPreferences.GOOGLE:
            const date = new Date()
            const { id } = await sendGmailByThread({ context, body, conversation })
            const { recipient, person } = conversation
            const to = await fetchPerson(context, recipient)
            const from = await fetchPerson(context, person)
            return {
              id,
              date,
              body,
              to: to.email,
              from: from.email
            }
          default:
            throw new Error('Cannot send message of this type')
        }
      }
    }
  }
}
