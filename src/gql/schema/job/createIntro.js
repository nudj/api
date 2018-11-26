const mailer = require('../../lib/mailer')
const { values: hirerTypes } = require('../enums/hirer-types')
const fetchIntegrationHelper = require('../../lib/fetch-integration-helper')

module.exports = {
  typeDefs: `
    extend type Job {
      createIntro(
        candidate: PersonCreateInput!
        consent: Boolean!
        notes: String
      ): Intro
    }
  `,
  resolvers: {
    Job: {
      createIntro: async (job, args, context) => {
        const {
          candidate: candidateData,
          consent,
          notes
        } = args
        const { userId } = context

        const [
          company,
          person,
          candidate
        ] = await Promise.all([
          context.store.readOne({
            type: 'companies',
            id: job.company
          }),
          context.store.readOne({
            type: 'people',
            id: userId
          }),
          context.store.readOneOrCreate({
            type: 'people',
            filters: {
              email: candidateData.email
            },
            data: candidateData
          })
        ])

        const intro = await context.store.create({
          type: 'intros',
          data: {
            person: person.id,
            job: job.id,
            candidate: candidate.id,
            consent,
            notes
          }
        })

        // Applicant details need to be sent to the company's integrated ATS
        if (company.ats) {
          const integration = await context.store.readOne({
            type: 'companyIntegrations',
            filters: { company: company.id }
          })
          const ats = fetchIntegrationHelper(integration)
          await ats.postCandidate({
            context,
            person,
            company,
            job,
            application: intro, // Purely for the ID for reference
            notes
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
          adminPeople.map(admin => mailer.sendNewIntroEmail({
            to: admin.email,
            hire: context.hire,
            job,
            person: admin
          }))
        )

        return intro
      }
    }
  }
}
