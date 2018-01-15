const orderBy = require('lodash/orderBy')
const { handleErrors } = require('../../lib')
const { fetchGmailMessages } = require('../../lib/google')
const { values: emailPreferences } = require('../enums/email-preference-types')

const fetchPersonById = (context, id) => {
  return context.transaction((store, params) => {
    const { id } = params
    return store.readOne({
      type: 'people',
      id
    })
    .then(person => {
      if (!person) throw new Error('No person found')
      return person
    })
  }, { id })
}

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
            const { recipient, person, created: date } = conversation
            return {
              date,
              sender: fetchPersonById(context, person),
              recipient: fetchPersonById(context, recipient)
            }
        }
      })
    }
  }
}
