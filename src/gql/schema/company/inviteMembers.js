const chunk = require('lodash/chunk')
const promiseSerial = require('promise-serial')
const hashGenerator = require('hash-generator')

const { logger } = require('@nudj/library')

const { handleErrors } = require('../../lib')
const {
  validateInviteesAndFetchEmailData,
  logInvitationsToIntercom
} = require('../../lib/helpers')
const {
  send,
  teammateInvitationEmailBodyTemplate
} = require('../../lib/mailer')
const intercom = require('../../lib/intercom')

const INTERCOM_BATCH_AMOUNT = 10

const stall = time => new Promise(resolve => setTimeout(resolve, time))

const triggerIntercomTracking = async ({
  company,
  emailAddresses,
  senderName,
  senderEmail
}) => {
  const intercomCompany = await intercom.fetchOrCreateCompanyByName(company.name)
  const batchedEmails = chunk(emailAddresses, INTERCOM_BATCH_AMOUNT)

  await promiseSerial(batchedEmails.map(emails => async () => {
    await Promise.all(emails.map(async email => {
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
    }))

    return emails.length === INTERCOM_BATCH_AMOUNT && stall(10000)
  }))

  return intercom.logEvent({
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
        const emailData = await validateInviteesAndFetchEmailData(company, args, context)
        const {
          from,
          subject,
          senderName,
          senderEmail,
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

        try {
          if (args.awaitIntercom) {
            await triggerIntercomTracking(emailData)
          } else {
            triggerIntercomTracking(emailData)
          }
        } catch (error) {
          logger('error', 'Intercom error', error)
        }

        return sendStatus
      })
    }
  }
}
