const omitBy = require('lodash/omitBy')

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
          context.store.readOneOrCreate({
            type: 'people',
            filters: { email: args.person.email },
            data: omitBy(args.person, ['company', 'role'])
          }),
          parentId && context.store.readOne({
            type: 'referrals',
            id: parentId
          }),
          context.store.readOne({
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

        const referral = await context.store.readOneOrCreate({
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
