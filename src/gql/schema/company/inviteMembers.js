const {
  validateInviteesAndFetchEmailData,
  logInvitationsToIntercom
} = require('../../lib/helpers')
const {
  send,
  teammateInvitationEmailBodyTemplate
} = require('../../lib/mailer')

module.exports = {
  typeDefs: `
    input InviteMemberPersonInput {
      email: String!
      firstName: String
    }

    extend type Company {
      inviteMembers(members: [InviteMemberPersonInput!]!): Status
    }
  `,
  resolvers: {
    Company: {
      inviteMembers: async (company, args, context) => {
        const emailData = await validateInviteesAndFetchEmailData(company, args, context)
        const {
          from,
          subject,
          senderName,
          jobs,
          members
        } = emailData

        const [ sendStatus ] = await Promise.all(
          members.map(({ email }) => send({
            from,
            to: email,
            subject,
            html: teammateInvitationEmailBodyTemplate({
              hire: context.hire,
              web: context.web,
              senderName,
              company,
              jobs,
              email: email
            })
          }))
        )

        if (args.awaitIntercom) {
          await logInvitationsToIntercom(emailData)
        } else {
          logInvitationsToIntercom(emailData)
        }

        return sendStatus
      }
    }
  }
}
