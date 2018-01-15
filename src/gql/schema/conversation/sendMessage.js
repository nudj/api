const { sendGmailByThread } = require('../../lib/google')
const { handleErrors } = require('../../lib')
const { values: emailPreferences } = require('../enums/email-preference-types')

module.exports = {
  typeDefs: `
    extend type Conversation {
      sendMessage(body: String): Status!
    }
  `,
  resolvers: {
    Conversation: {
      sendMessage: handleErrors(async (conversation, args, context) => {
        const { body } = args
        const { type } = conversation

        switch (type) {
          case emailPreferences.GOOGLE:
            await sendGmailByThread({ context, body, conversation })
            return { success: true }
          default:
            throw new Error('Cannot send message of this type')
        }
      })
    }
  }
}
