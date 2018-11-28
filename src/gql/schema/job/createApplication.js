const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')
const { logger } = require('@nudj/library')
const intercom = require('../../lib/intercom')
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
          context.sql.readOne({
            type: 'people',
            id: personId
          }),
          context.sql.readOne({
            type: 'referrals',
            id: referralId
          }),
          context.sql.readOne({
            type: 'companies',
            id: job.company
          })
        ])

        if (!person) throw new Error(`Person with id ${personId} does not exist`)

        const application = await context.sql.readOneOrCreate({
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
          const integration = await context.sql.readOne({
            type: 'companyIntegrations',
            filters: { company: company.id }
          })
          const ats = fetchIntegrationHelper(integration)
          await ats.postCandidate({
            context,
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
          const lead = await intercom.fetchLeadBy({ email })

          if (lead && lead.id) {
            await intercom.convertLeadToUser({ email, id: lead.id })
          } else {
            const intercomUserData = omitBy({
              email,
              name,
              custom_attributes: {
                lastJobAppliedFor: `${job.title} at ${company.name}`
              }
            }, isNil)
            await intercom.createUser(intercomUserData)
          }

          await intercom.logEvent({
            event_name: 'new-application',
            email,
            metadata: {
              jobTitle: job.title,
              company: company.name
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
