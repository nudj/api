const omit = require('lodash/omit')
const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')
const { logger } = require('@nudj/library')
const intercom = require('@nudj/library/lib/analytics/intercom')

const fetchIntegrationHelper = require('../../lib/fetch-integration-helper')

module.exports = {
  typeDefs: `
    extend type Job {
      getOrCreatePersonAndApplication(person: PersonCreateInput!, referral: ID): Application
    }
  `,
  resolvers: {
    Job: {
      getOrCreatePersonAndApplication: async (job, args, context) => {
        const { referral: referralId } = args

        const person = await context.sql.readOneOrCreate({
          type: 'people',
          filters: { email: args.person.email },
          data: omit(args.person, ['company', 'role'])
        })

        const [
          referral,
          company
        ] = await Promise.all([
          context.sql.readOne({
            type: 'referrals',
            id: referralId
          }),
          context.sql.readOne({
            type: 'companies',
            id: job.company
          })
        ])

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
          const integrationHelper = fetchIntegrationHelper(integration)
          await integrationHelper.postCandidate({
            sql: context.sql,
            referral,
            person,
            company,
            job,
            application
          })
        }

        const { firstName, lastName, email } = person
        const name = firstName && lastName ? `${firstName} ${lastName}` : null

        try {
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
