const orderBy = require('lodash/orderBy')
const { handleErrors } = require('../../lib')
const { fetchGmailMessages } = require('../../lib/google')
const { values: emailPreferences } = require('../enums/email-preference-types')

module.exports = {
  typeDefs: `
    extend type Conversation {
      latestMessage: Message!
    }
  `,
  resolvers: {
    Conversation: {
      latestMessage: handleErrors(async (conversation, args, context) => {
        switch (conversation.type) {
          case emailPreferences.GOOGLE:
            const messages = await fetchGmailMessages({ context, conversation })
            return orderBy(messages, (message) => message.date, ['desc'])[0]
          default:
            const { recipient, sender: person, created: date } = conversation
            return {
              date,
              person,
              recipient
            }
        }
      })
    }
  }
}
