const { handleErrors } = require('../../lib')
const {
  setupMembersAndFetchEmailData,
  logInvitationsToIntercom
} = require('../../lib/helpers')
const {
  send,
  teammateInvitationEmailBodyTemplate
} = require('../../lib/mailer')

module.exports = {
  typeDefs: `
    extend type Company {
      inviteMembers(emailAddresses: [String!]!): Status
    }
  `,
  resolvers: {
    Company: {
      inviteMembers: handleErrors(async (company, args, context) => {
        const emailData = await validateInviteesAndFetchEmailData(company, args, context)
        const {
          from,
          subject,
          senderName,
          jobs,
          emailAddresses
        } = emailData

        const [ sendStatus ] = await Promise.all(
          emailAddresses.map(email => send({
            from,
            to: email,
            subject,
            html: teammateInvitationEmailBodyTemplate({
              web: context.web,
              senderName,
              company,
              jobs,
              email
            })
          }))
        )

        if (args.awaitIntercom) {
          await logInvitationsToIntercom(emailData)
        } else {
          logInvitationsToIntercom(emailData)
        }

        return sendStatus
      })
    }
  }
}
