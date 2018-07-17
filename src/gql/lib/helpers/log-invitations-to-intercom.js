const promiseSerial = require('promise-serial')
const chunk = require('lodash/chunk')
const { logger } = require('@nudj/library')
const intercom = require('../intercom')

const INTERCOM_BATCH_AMOUNT = 10

const stall = time => new Promise(resolve => setTimeout(resolve, time))

const logInvitationsToIntercom = async ({
  company,
  emailAddresses,
  senderName,
  senderEmail
}) => {
  try {
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
  } catch (error) {
    logger('error', 'Intercom error', error)
  }
}

module.exports = logInvitationsToIntercom
