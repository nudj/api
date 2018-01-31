const orderBy = require('lodash/orderBy')
const { handleErrors } = require('../../lib')
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
      latestMessage: handleErrors(async (conversation, args, context) => {
        const person = await fetchPerson(context, conversation.person)
        if (conversation.type === emailPreferences.GOOGLE && person.emailPreference === emailPreferences.GOOGLE) {
          const messages = await fetchGmailMessages({ context, conversation })
          return orderBy(messages, (message) => message.date, ['desc'])[0]
        } else {
          const { recipient, person, created: date } = conversation
          return {
            date,
            to: recipient,
            from: person
          }
        }
      })
    }
  }
}
