const { fetchGmailSubject } = require('../../lib/google')
const fetchPerson = require('../../lib/helpers/fetch-person')
const { values: emailPreferences } = require('../enums/email-preference-types')

module.exports = {
  typeDefs: `
    extend type Conversation {
      subject: String
    }
  `,
  resolvers: {
    Conversation: {
      subject: async (conversation, args, context) => {
        const person = await fetchPerson(context, conversation.person)
        if (conversation.type === emailPreferences.GOOGLE && person.emailPreference === emailPreferences.GOOGLE) {
          return fetchGmailSubject({ context, conversation })
        }
        return null
      }
    }
  }
}
