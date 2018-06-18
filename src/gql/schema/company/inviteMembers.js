const uniq = require('lodash/uniq')
const { logger } = require('@nudj/library')
const fetchPerson = require('../../lib/helpers/fetch-person')
const { handleErrors } = require('../../lib')
const { values: hirerTypes } = require('../enums/hirer-types')
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

        const jobs = await context.store.readAll({
          type: 'jobs',
          filters: {
            company: company.id
          }
        })

        await Promise.all(emailAddresses.map(async email => {
          const person = await context.store.readOneOrCreate({
            type: 'people',
            filters: { email },
            data: { email }
          })
          const hirer = await context.store.readOne({
            type: 'hirers',
            filters: { person: person.id }
          })

          if (!hirer) {
            return context.store.create({
              type: 'hirers',
              data: {
                person: person.id,
                company: company.id,
                onboarded: false,
                type: hirerTypes.MEMBER
              }
            })
          } else if (hirer.company !== company.id) {
            await sendInternalEmail({
              subject: 'Teammate invitation failed',
              html: `A hirer for ${company.name} attempted to add a teammate with the email address "${email}", but that email address is already related to a different company with id: "${hirer.company}"`
            })
            throw new Error(`User with email address "${email}" is already signed up with another company`)
          }

          return hirer
        }))

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
