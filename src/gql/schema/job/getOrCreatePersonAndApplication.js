const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')
const { logger } = require('@nudj/library')

const fetchIntegrationHelper = require('../../lib/fetch-integration-helper')
const intercom = require('../../lib/intercom')
const mailer = require('../../lib/mailer')
const { values: hirerTypes } = require('../enums/hirer-types')

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

        const person = await context.store.readOneOrCreate({
          type: 'people',
          filters: { email: args.person.email },
          data: omitBy(args.person, ['company', 'role'])
        })

        const [
          referral,
          company
        ] = await Promise.all([
          context.store.readOne({
            type: 'referrals',
            id: referralId
          }),
          context.store.readOne({
            type: 'companies',
            id: job.company
          })
        ])

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
            referral,
            person,
            company,
            job,
            application
          })
        }

        // email admins with the great news!
        const adminHirers = await context.store.readAll({
          type: 'hirers',
          filters: {
            company: company.id,
            type: hirerTypes.ADMIN
          }
        })
        const adminPeople = await context.store.readMany({
          type: 'people',
          ids: adminHirers.map(admin => admin.person)
        })
        await Promise.all(
          adminPeople.map(admin => mailer.sendNewApplicationEmail({
            to: admin.email,
            hire: context.hire,
            job,
            person: admin
          }))
        )

        const { firstName, lastName, email } = person
        const name = firstName && lastName ? `${firstName} ${lastName}` : null

        try {
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
