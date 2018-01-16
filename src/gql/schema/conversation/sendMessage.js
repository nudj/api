const { sendGmailByThread } = require('../../lib/google')
const { handleErrors } = require('../../lib')
const { values: emailPreferences } = require('../enums/email-preference-types')

module.exports = {
  typeDefs: `
    extend type Conversation {
      sendMessage(body: String): Message!
    }
  `,
  resolvers: {
    Conversation: {
      sendMessage: handleErrors(async (conversation, args, context) => {
        const { body } = args
        const { type } = conversation

        if (!body) throw new Error('No message body')

        switch (type) {
          case emailPreferences.GOOGLE:
            const { id } = await sendGmailByThread({ context, body, conversation })
            const { recipient: to, person: from } = conversation
            const date = new Date()
            return { id, date, body, to, from }
          default:
            throw new Error('Cannot send message of this type')
        }
      })
    }
  }
}

// {
//   id: `${threadIds[0]}-message1`,
//   date: '2018-01-16T02:51:58.000+00:00',
//   body: 'Hello, how are you?',
//   to: 'person5',
//   from: 'person1'
// },
