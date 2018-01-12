const pick = require('lodash/pick')
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

module.exports = {
  typeDefs: `
    extend type Person {
      sendEmail(
        type: EmailPreference!
        body: String!
        from: String!
        subject: String!
        to: String!
      ): Data
    }
  `,
  resolvers: {
    Person: {
      sendEmail: handleErrors(async (person, args, context) => {
        const email = pick(args, ['body', 'subject', 'to', 'from'])
        const { type, to } = args

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
