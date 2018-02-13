const { handleErrors } = require('../../lib')
const { fetchGmailMessages } = require('../../lib/google')
const { values: emailPreferences } = require('../enums/email-preference-types')
const fetchPerson = require('../../lib/helpers/fetch-person')

module.exports = {
  typeDefs: `
    extend type Conversation {
      messages: [Message!]!
    }
  `,
  resolvers: {
    Conversation: {
      messages: handleErrors(async (conversation, args, context) => {
        switch (conversation.type) {
          case emailPreferences.GOOGLE:
            return fetchGmailMessages({ context, conversation })
          default:
            const { recipient, person, created: date } = conversation
            const to = await fetchPerson(context, recipient)
            const from = await fetchPerson(context, person)
            return [
              {
                date,
                to: to.email,
                from: from.email
              }
            ]
        }
      })
    }
  }
}
