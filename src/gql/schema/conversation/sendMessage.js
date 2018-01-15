const { sendGmailByThread } = require('../../lib/google')
const { handleErrors } = require('../../lib')
const { values: emailPreferences } = require('../enums/email-preference-types')

module.exports = {
  typeDefs: `
    extend type Conversation {
      sendMessage(body: String): Data
    }
  `,
  resolvers: {
    Conversation: {
      sendMessage: handleErrors(async (conversation, args, context) => {
        const { body } = args
        const { type } = conversation

        switch (type) {
          case emailPreferences.GOOGLE:
            return await sendGmailByThread({ context, body, conversation })
          default:
            return null
        }
      })
    }
  }
}
