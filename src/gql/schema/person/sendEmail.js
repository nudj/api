const { sendGmail } = require('../../lib/google')
const { handleErrors } = require('../../lib')
const { values: emailPreferences } = require('../enums/email-preference-types')

const createConversation = ({ context, type, to, person, threadId }) => {
  return context.transaction((store, params) => {
    const { to, threadId, person, type } = params
    return store.readOne({
      type: 'people',
      filters: { email: to }
    })
    .then(recipient => {
      return store.create({
        type: 'conversations',
        data: {
          type,
          threadId,
          person: person.id,
          recipient: recipient.id
        }
      })
    })
  }, { to, threadId, type, person })
}

const fetchEmail = (context, id) => {
  return context.transaction((store, params) => {
    const { id } = params
    return store.readOne({
      type: 'connections',
      id
    })
    .then(connection => {
      if (!connection) throw new Error(`No connection for id ${id} found`)
      return store.readOne({
        type: 'people',
        id: connection.person
      })
      .then(person => {
        if (!person) throw new Error(`No person for id ${connection.person} found`)
        return person.email
      })
    })
  }, { id })
}

module.exports = {
  typeDefs: `
    extend type Person {
      sendEmail(
        body: String!
        subject: String!
        to: ID!
      ): Conversation!
    }
  `,
  resolvers: {
    Person: {
      sendEmail: handleErrors(async (person, args, context) => {
        const { body, subject, to: recipient } = args
        if (!body) throw new Error('No message body')

        const { emailPreference: type } = person
        const from = `${person.firstName} ${person.lastName} <${person.email}>`
        const to = await fetchEmail(context, recipient)
        const email = { body, subject, to, from }

        switch (type) {
          case emailPreferences.GOOGLE:
            const { threadId } = await sendGmail({ context, email, person })
            return createConversation({ context, type, to, person, threadId })
          default:
            return createConversation({ context, type, to, person })
        }
      })
    }
  }
}
