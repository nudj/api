const { sendGmail } = require('../../lib/google')

module.exports = {
  typeDefs: `
    extend type Person {
      sendEmail(
        body: String!
        from: String!
        subject: String!
        to: String
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
          .then(account => sendGmail({ email, accessToken: account.data.accessToken }))
          .then(response => response)
        }, {
          person: person.id,
          email: { body, from, subject, to }
        })
      }
    }
  }
}
