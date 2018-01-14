const { fetchGmailSubject } = require('../../lib/google')
const { values: emailPreferences } = require('../enums/email-preference-types')

module.exports = {
  typeDefs: `
    extend type Conversation {
      subject: String!
    }
  `,
  resolvers: {
    Conversation: {
      subject: async (conversation, args, context) => {
        switch (conversation.type) {
          case emailPreferences.GOOGLE:
            return await fetchGmailSubject({ context, conversation })
          default:
            return null
        }
      }
    }
  }
}
