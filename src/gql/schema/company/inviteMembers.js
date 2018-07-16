const uniq = require('lodash/uniq')
const { logger } = require('@nudj/library')
const hashGenerator = require('hash-generator')

const fetchPerson = require('../../lib/helpers/fetch-person')
const { handleErrors } = require('../../lib')
const {
  send,
  sendInternalEmail,
  teammateInvitationEmailBodyTemplate
} = require('../../lib/mailer')
const intercom = require('../../lib/intercom')

const triggerIntercomTracking = async ({
  company,
  emailAddresses,
  senderName,
  senderEmail
}) => {
  const intercomCompany = await intercom.fetchOrCreateCompanyByName(company.name)

  await emailAddresses.map(async email => {
    await intercom.createUniqueUserAndTag({
      email,
      companies: [
        {
          name: intercomCompany.name,
          company_id: intercomCompany.company_id
        }
      ]
    }, 'team-member')
    await intercom.logEvent({
      event_name: 'invited',
      email,
      metadata: {
        category: 'onboarding',
        invited_by: senderName || senderEmail
      }
    })
  })
  await intercom.logEvent({
    event_name: 'invites-sent',
    email: senderEmail,
    metadata: {
      category: 'onboarding'
    }
  })
}

module.exports = {
  typeDefs: `
    extend type Company {
      inviteMembers(emailAddresses: [String!]!): Status
    }
  `,
  resolvers: {
    Company: {
      inviteMembers: handleErrors(async (company, args, context) => {
        const emailAddresses = uniq(args.emailAddresses)

        if (!emailAddresses.length) {
          throw new Error('No email addresses provided')
        }

        if (!company.hash) {
          company = await context.sql.update({
            type: 'companies',
            id: company.id,
            data: {
              hash: hashGenerator(128)
            }
          })
        }

        // ensure the people being invited are not already hirers at another company
        await Promise.all(emailAddresses.map(async email => {
          const person = await context.sql.readOne({
            type: 'people',
            filters: { email }
          })

          if (!person) return

          const hirer = await context.sql.readOne({
            type: 'hirers',
            filters: { person: person.id }
          })

          if (!hirer) return

          if (hirer.company !== company.id) {
            await sendInternalEmail({
              subject: 'Teammate invitation failed',
              html: `A hirer for ${company.name} attempted to add a teammate with the email address "${email}", but that email address is already related to a different company with id: "${hirer.company}"`
            })
            throw new Error(`User with email address "${email}" is already signed up with another company`)
          }
        }))

        const {
          firstName,
          lastName,
          email: senderEmail
        } = await fetchPerson(context, context.userId)
        const senderName = firstName && lastName && `${firstName} ${lastName}`
        const from = senderName
          ? `${senderName} via nudj <hello@nudj.co>`
          : `Nudj <hello@nudj.co>`
        const subject = senderName
          ? `${senderName} has invited you to join them on nudj`
          : `You've been invited to join nudj!`
        const jobs = await context.sql.readAll({
          type: 'jobs',
          filters: {
            company: company.id
          }
        })

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

        try {
          triggerIntercomTracking({
            company,
            emailAddresses,
            senderName,
            senderEmail
          })
        } catch (error) {
          logger('error', 'Intercom error', error)
        }

        return sendStatus
      })
    }
  }
}
