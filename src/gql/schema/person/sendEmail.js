const get = require('lodash/get')
const { sendGmail } = require('../../lib/google')
const { handleErrors } = require('../../lib')
const { values: emailPreferences } = require('../enums/email-preference-types')

const createConversation = async ({ context, type, to, person, threadId }) => {
  const recipient = await context.store.readOne({
    type: 'people',
    filters: { email: to }
  })
  return context.store.create({
    type: 'conversations',
    data: {
      type,
      threadId,
      person: person.id,
      recipient: recipient.id
    }
  })
}

const fetchEmail = async (context, personId) => {
  const person = await context.store.readOne({
    type: 'people',
    id: personId
  })
  if (!person) throw new Error(`No person for id ${personId} found`)
  return person.email
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

        const {
          emailPreference: type = emailPreferences.OTHER
        } = person
        const name = `${get(person, 'firstName', '')} ${get(person, 'lastName', '')}`
        const from = `${name} <${get(person, 'email', '')}>`
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
