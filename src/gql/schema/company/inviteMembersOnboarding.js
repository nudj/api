const { renderSimpleTemplate } = require('@nudj/library')
const { handleErrors } = require('../../lib')
const {
  validateInviteesAndFetchEmailData,
  logInvitationsToIntercom
} = require('../../lib/helpers')
const { send } = require('../../lib/mailer')

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
      inviteMembersOnboarding: handleErrors(async (company, args, context) => {
        const emailData = await validateInviteesAndFetchEmailData(company, args, context)
        const {
          senderName,
          jobs,
          members,
          hash
        } = emailData

        const job = jobs[0]
        const from = senderName ? `${senderName} via nudj <hello@nudj.co>` : `nudj <hello@nudj.co>`

        const [ sendStatus ] = await Promise.all(
          members.map(({ email, firstName }) => {
            const templateData = {
              firstName: firstName || 'there',
              link: `${context.web.protocol}://${process.env.HIRE_HOSTNAME}/invitation-accept/${hash}`,
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

        return sendStatus
      })
    }
  }
}
