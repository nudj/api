const { renderSimpleTemplate, getInvitationUrl } = require('@nudj/library')
const intercom = require('@nudj/library/lib/analytics/intercom')

const {
  validateInviteesAndFetchEmailData,
  logInvitationsToIntercom
} = require('../../lib/helpers')
const { INTERCOM: { PROPS: { COMPANY: { HAS_HAD_TEAM_INVITED } } } } = require('../../lib/constants')
const {
  send,
  fromViaNudj
} = require('../../lib/mailer')

module.exports = {
  typeDefs: `
    extend type Company {
      inviteMembersOnboarding(
        members: [InviteMemberPersonInput!]!,
        subject: String!,
        body: String!
      ): Status
    }
  `,
  resolvers: {
    Company: {
      inviteMembersOnboarding: async (company, args, context) => {
        const emailData = await validateInviteesAndFetchEmailData(company, args, context)
        const {
          senderName,
          jobs,
          members,
          hash
        } = emailData

        const job = jobs[0]
        const from = senderName && fromViaNudj(senderName)
        const invitationUrl = getInvitationUrl({
          protocol: context.web.protocol,
          hostname: process.env.HIRE_HOSTNAME,
          hash
        })

        const [ sendStatus ] = await Promise.all(
          members.map(({ email, firstName }) => {
            const templateData = {
              firstName: firstName || 'there',
              link: invitationUrl,
              job,
              company,
              senderName
            }

            return send({
              from,
              to: email,
              subject: renderSimpleTemplate({
                template: args.subject,
                data: templateData
              })[0].join(''),
              html: renderSimpleTemplate({
                template: args.body,
                data: templateData,
                pify: para => `<p>${para.join('')}</p>`
              }).join('')
            })
          })
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
