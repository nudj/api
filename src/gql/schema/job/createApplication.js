const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')
const { logger } = require('@nudj/library')
const intercom = require('@nudj/library/lib/analytics/intercom')
const fetchIntegrationHelper = require('../../lib/fetch-integration-helper')

module.exports = {
  typeDefs: `
    extend type Job {
      createApplication(person: ID!, referral: ID): Application
    }
  `,
  resolvers: {
    Job: {
      createApplication: async (job, args, context) => {
        const {
          person: personId,
          referral: referralId
        } = args

        const [
          person,
          referral,
          company
        ] = await Promise.all([
          context.store.readOne({
            type: 'people',
            id: personId
          }),
          context.store.readOne({
            type: 'referrals',
            id: referralId
          }),
          context.store.readOne({
            type: 'companies',
            id: job.company
          })
        ])

        if (!person) throw new Error(`Person with id ${personId} does not exist`)

        const application = await context.store.readOneOrCreate({
          type: 'applications',
          filters: {
            job: job.id,
            person: person.id
          },
          data: {
            job: job.id,
            person: person.id,
            referral: referral && referral.id
          }
        })

        // Applicant details need to be sent to the company's integrated ATS
        if (company.ats) {
          const integration = await context.store.readOne({
            type: 'companyIntegrations',
            filters: { company: company.id }
          })
          const integrationHelper = fetchIntegrationHelper(integration)
          await integrationHelper.postCandidate({
            store: context.store,
            person,
            company,
            job,
            application,
            referral
          })
        }

        try {
          const { firstName, lastName, email } = person
          const name = firstName && lastName ? `${firstName} ${lastName}` : null
          const lead = await intercom.leads.getBy({ email })

          if (lead && lead.id) {
            await intercom.leads.convertToUser(lead)
          } else {
            const intercomUserData = omitBy({
              email,
              name,
              custom_attributes: {
                lastJobAppliedFor: `${job.title} at ${company.name}`
              }
            }, isNil)
            await intercom.users.create(intercomUserData)
          }

          await intercom.users.logEvent({
            user: { email },
            event: {
              name: 'new-application',
              metadata: {
                jobTitle: job.title,
                company: company.name
              }
            }
          })
        } catch (error) {
          logger('error', 'Intercom error', error)
        }

        return application
      }
    }
  }
}
