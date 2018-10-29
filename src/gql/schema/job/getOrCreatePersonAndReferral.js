const omit = require('lodash/omit')

const mailer = require('../../lib/mailer')

module.exports = {
  typeDefs: `
    extend type Job {
      getOrCreatePersonAndReferral(
        person: PersonCreateInput!
        parent: ID
      ): Referral
    }
  `,
  resolvers: {
    Job: {
      getOrCreatePersonAndReferral: async (job, args, context) => {
        const { parent: parentId } = args

        const [
          person,
          parent,
          company
        ] = await Promise.all([
          context.sql.readOneOrCreate({
            type: 'people',
            filters: { email: args.person.email },
            data: omit(args.person, ['company', 'role'])
          }),
          parentId && context.sql.readOne({
            type: 'referrals',
            id: parentId
          }),
          context.sql.readOne({
            type: 'companies',
            id: job.company
          })
        ])

        const referralData = {
          job: job.id,
          person: person.id
        }

        if (parent) {
          referralData.parent = parent.id
        }

        const referral = await context.sql.readOneOrCreate({
          type: 'referrals',
          filters: {
            job: job.id,
            person: person.id
          },
          data: referralData
        })

        await mailer.sendReferralLinkEmailBodyTemplate({
          to: person.email,
          web: context.web,
          person,
          company,
          job,
          referral
        })

        return referral
      }
    }
  }
}
