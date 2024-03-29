const get = require('lodash/get')
const { logger } = require('@nudj/library')
const { sendGmail } = require('../../lib/google')
const intercom = require('@nudj/library/lib/analytics/intercom')
const { values: emailPreferences } = require('../enums/email-preference-types')

const createConversation = async ({ context, type, to, person, threadId }) => {
  const recipient = await context.sql.readOne({
    type: 'people',
    filters: { email: to }
  })
  return context.sql.create({
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
  const person = await context.sql.readOne({
    type: 'people',
    id: personId
  })
  if (!person) throw new Error(`No person for id ${personId} found`)
  return person.email
}

const trackEmailEvent = (email) => {
  try {
    intercom.users.logEvent({
      user: { email },
      event: {
        name: 'request sent'
      }
    })
  } catch (error) {
    logger('error', 'Intercom Error', error)
  }
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
      sendEmail: async (person, args, context) => {
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
            trackEmailEvent(person.email)
            return createConversation({ context, type, to, person, threadId })
          default:
            trackEmailEvent(person.email)
            return createConversation({ context, type, to, person })
        }
      }
    }
  }
}
