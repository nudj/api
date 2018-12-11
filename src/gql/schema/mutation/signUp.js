const intercom = require('@nudj/library/lib/analytics/intercom')
const mailer = require('../../lib/mailer')

module.exports = {
  typeDefs: `
    extend type Mutation {
      signUp(
        firstName: String
        lastName: String
        email: String!
        title: String
        role: String
      ): Status
    }
  `,
  resolvers: {
    Mutation: {
      signUp: (root, args) => {
        const {
          firstName,
          lastName,
          email,
          title,
          role
        } = args
        intercom.leads.create({
          email,
          name: `${firstName} ${lastName}`,
          custom_attributes: {
            job_title: title,
            role
          },
          tags: ['nudjee']
        })
        return mailer.sendInternalEmail({
          subject: 'Sign-up for Updates',
          html: `
            <html>
            <body>
              <br/>
              <p>Hi team,</p>
              <p>A new user has signed up.</p>
              <br/>
              <p>
                <strong>Full name:</strong> ${firstName} ${lastName}<br/>
                <strong>Email:</strong> ${email}<br/>
                <strong>Job Title:</strong> ${title}<br/>
                <strong>Role(s):</strong> ${role}<br/>
              </p>
              <br/>
              <p>Love<br/> Your friendly nudj bot.</p>
              <br/>
            </body>
            </html>
          `
        })
      }
    }
  }
}
