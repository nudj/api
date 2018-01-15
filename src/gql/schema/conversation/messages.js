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
    type Message {
      id: ID
      body: String
      date: DateTime!
      sender: Person!
      recipient: Person!
    }

    extend type Conversation {
      messages: [Message!]!
    }
  `,
  resolvers: {
    Conversation: {
      messages: handleErrors(async (conversation, args, context) => {
        switch (conversation.type) {
          case emailPreferences.GOOGLE:
            return await fetchGmailMessages({ context, conversation })
          default:
            const { recipient, person, created: date } = conversation
            return [
              {
                date,
                sender: fetchPersonById(context, person),
                recipient: fetchPersonById(context, recipient)
              }
            ]
        }
      })
    }
  }
}
