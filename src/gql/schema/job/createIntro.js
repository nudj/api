const mailer = require('../../lib/mailer')
const { values: hirerTypes } = require('../enums/hirer-types')

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
          context.sql.readOne({
            type: 'companies',
            id: job.company
          }),
          context.sql.readOne({
            type: 'people',
            id: userId
          }),
          context.sql.readOneOrCreate({
            type: 'people',
            filters: {
              email: candidateData.email
            },
            data: candidateData
          })
        ])

        const intro = await context.sql.create({
          type: 'intros',
          data: {
            person: person.id,
            job: job.id,
            candidate: candidate.id,
            consent,
            notes
          }
        })

        // email admins with the great news!
        const adminHirers = await context.sql.readAll({
          type: 'hirers',
          filters: {
            company: company.id,
            type: hirerTypes.ADMIN
          }
        })
        const adminPeople = await context.sql.readMany({
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