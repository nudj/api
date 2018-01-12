const { sendGmail, validateTokens } = require('../../lib/google')

module.exports = {
  typeDefs: `
    extend type Person {
      sendEmail(
        body: String!
        from: String!
        subject: String!
        to: String!
      ): Data
    }
  `,
  resolvers: {
    Person: {
      sendEmail: (person, args, context) => {
        const { body, from, subject, to } = args
        return context.transaction((store, params) => {
          const { person, email } = params
          return store.readOne({
            type: 'accounts',
            filters: { person }
          })
          .then(account => {
            const { accessToken, refreshToken } = account.data
            return validateTokens(accessToken, refreshToken)
              .then(tokens => {
                if (tokens.refreshed) {
                  const data = { accessToken: tokens.accessToken, refreshToken }
                  return store.update({
                    type: 'accounts',
                    id: account.id,
                    data: { data }
                  })
                }
                return Promise.resolve(account)
              })
          })
          .then(account => {
            const { accessToken } = account.data
            return sendGmail({ email, accessToken })
          })
          .then(emailResponse => {
            return store.readOne({
              type: 'people',
              filters: { email: email.to }
            })
            .then(recipient => {
              return store.create({
                type: 'conversations',
                data: {
                  person,
                  recipient: recipient.id,
                  type: 'GOOGLE',
                  threadId: emailResponse.threadId
                }
              })
            })
          })
        }, {
          person: person.id,
          email: { body, from, subject, to }
        })
      }
    }
  }
}
