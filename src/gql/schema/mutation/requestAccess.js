const intercom = require('../../lib/intercom')
const mailer = require('../../lib/mailer')

module.exports = {
  typeDefs: `
    extend type Mutation {
      requestAccess(
        firstName: String
        lastName: String
        email: String!
        company: String
        externalJobUrl: String
      ): Status
    }
  `,
  resolvers: {
    Mutation: {
      requestAccess: (root, args) => {
        const {
          firstName,
          lastName,
          email,
          company,
          externalJobUrl
        } = args
        intercom.createUniqueLeadAndTag({
          name: `${firstName} ${lastName}`,
          email,
          companies: [
            {
              company_id: company.toLowerCase().split(' ').join('-'),
              name: company
            }
          ]
        }, 'hirer')
        return mailer.send({
          from: 'hello@nudj.co',
          to: 'hello@nudj.co',
          subject: 'Request Access',
          html: `
            <html>
            <body>
              <br/>
              <p>Hi team,</p>
              <p>A new user has requested access.</p>
              <br/>
              <p>
                <strong>Full name:</strong> ${firstName} ${lastName}<br/>
                <strong>Email:</strong> ${email}<br/>
                <strong>Company Name:</strong> ${company}<br/>
                <strong>Job(s):</strong> <a href='${externalJobUrl}'>${externalJobUrl}</a><br/>
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
