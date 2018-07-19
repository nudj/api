const orderBy = require('lodash/orderBy')

const { fetchGmailMessages } = require('../../lib/google')
const fetchPerson = require('../../lib/helpers/fetch-person')
const { values: emailPreferences } = require('../enums/email-preference-types')

module.exports = {
  typeDefs: `
    extend type Conversation {
      latestMessage: Message!
    }
  `,
  resolvers: {
    Conversation: {
      latestMessage: async (conversation, args, context) => {
        const person = await fetchPerson(context, conversation.person)
        if (conversation.type === emailPreferences.GOOGLE && person.emailPreference === emailPreferences.GOOGLE) {
          const messages = await fetchGmailMessages({ context, conversation })
          return orderBy(messages, (message) => message.date, ['desc'])[0]
        } else {
          const { recipient, person, created: date } = conversation
          const from = await fetchPerson(context, person)
          const to = await fetchPerson(context, recipient)
          return {
            date,
            to: to.email,
            from: from.email
          }
        }
      }
    }
  }
}
