const { intercom } = require('@nudj/library/analytics')

const {
  validateInviteesAndFetchEmailData,
  logInvitationsToIntercom
} = require('../../lib/helpers')
const { INTERCOM: { PROPS: { COMPANY: { HAS_HAD_TEAM_INVITED } } } } = require('../../lib/constants')
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
              web: context.web,
              senderName,
              company: emailData.company,
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

        await intercom.companies.update({
          company: { name: company.name },
          data: {
            custom_attributes: {
              [HAS_HAD_TEAM_INVITED]: true
            }
          }
        })

        return sendStatus
      }
    }
  }
}
