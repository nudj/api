const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')
const { logger } = require('@nudj/library')
const intercom = require('../../lib/intercom')

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
          data: omitBy(args.person, ['company', 'role'])
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
