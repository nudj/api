const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')
const { logger } = require('@nudj/library')
const intercom = require('../../lib/intercom')

module.exports = {
  typeDefs: `
    extend type Job {
      createReferralForUser(person: ID!, parent: ID): Referral
    }
  `,
  resolvers: {
    Job: {
      createReferralForUser: async (job, args, context) => {
        const {
          person: personId,
          parent: parentId
        } = args

        const [
          person,
          parent,
          company
        ] = await Promise.all([
          context.sql.readOne({
            type: 'people',
            id: personId
          }),
          context.sql.readOne({
            type: 'referrals',
            id: parentId
          }),
          context.sql.readOne({
            type: 'companies',
            id: job.company
          })
        ])

        if (!person) throw new Error(`Person with id ${personId} does not exist`)

        const referral = await context.sql.readOneOrCreate({
          type: 'referrals',
          filters: {
            job: job.id,
            person: person.id
          },
          data: {
            job: job.id,
            person: person.id,
            parent: parent && parent.id
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
                lastJobReferredFor: `${job.title} at ${company.name}`
              }
            }, isNil)
            await intercom.createUser(intercomUserData)
          }

          await intercom.logEvent({
            event_name: 'new-referral',
            email,
            metadata: {
              jobTitle: job.title,
              company: company.name
            }
          })
        } catch (error) {
          logger('error', 'Intercom error', error)
        }

        return referral
      }
    }
  }
}
