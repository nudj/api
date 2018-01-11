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
          const { user, email } = params
          return sendGmail({ email, accessToken })
            .then(response => response)
        }, {
          user: person,
          email: { body, from, subject, to }
        })
      }
    }
  }
}

// const email = {
//   body: message,
//   from: `${senderFirstName} ${senderLastName} <${get(data, 'person.email', '')}>`,
//   subject: get(data, 'subject', 'Can you help me out?'),
//   to: get(data, 'recipient.email')
// }

// accessToken = ya29.Gl0_BU6jYxlN06m9KlbuH2T_riathDVZrb5oifvoS3ZzLCypmX-TwnLVm7J-pn3nUT2EbgvpiLifYElYHN_Ooj1FTDDDkr78XbLuawj3VKbaFAZF12WGIYZ70SlVG9Q
