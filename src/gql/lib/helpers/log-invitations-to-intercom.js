const promiseSerial = require('promise-serial')
const chunk = require('lodash/chunk')
const { logger } = require('@nudj/library')
const { intercom } = require('@nudj/library/analytics')

const INTERCOM_BATCH_AMOUNT = 10

const stall = time => new Promise(resolve => setTimeout(resolve, time))

const logInvitationsToIntercom = async ({
  company,
  emailAddresses,
  senderName,
  senderEmail
}) => {
  try {
    const intercomCompany = await intercom.companies.getOrCreate({ name: company.name })
    const batchedEmails = chunk(emailAddresses, INTERCOM_BATCH_AMOUNT)

    await promiseSerial(batchedEmails.map(emails => async () => {
      await Promise.all(emails.map(async email => {
        const lead = await intercom.leads.create({
          email,
          companies: [
            {
              name: intercomCompany.name,
              company_id: intercomCompany.company_id
            }
          ],
          tags: ['team-member']
        })
        await intercom.leads.logEvent({
          lead,
          event: {
            name: 'invited',
            metadata: {
              category: 'onboarding',
              invited_by: senderName || senderEmail
            }
          }
        })
      }))

      return emails.length === INTERCOM_BATCH_AMOUNT && stall(10000)
    }))

    return intercom.users.logEvent({
      user: { email: senderEmail },
      event: {
        name: 'invites-sent',
        metadata: {
          category: 'onboarding'
        }
      }
    })
  } catch (error) {
    logger('error', 'Intercom error', error)
  }
}

module.exports = logInvitationsToIntercom
