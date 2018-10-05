const { values: hirerTypes } = require('../enums/hirer-types')

module.exports = {
  typeDefs: `
    extend type Job {
      introsForHirer: [Intro!]!
    }
  `,
  resolvers: {
    Job: {
      introsForHirer: async (job, args, context) => {
        const { userId } = context
        const hirer = await context.sql.readOne({
          type: 'hirers',
          filters: {
            person: userId,
            company: job.company
          }
        })
        if (!hirer) throw new Error('User is not a hirer for this company')
        const filters = {
          job: job.id,
          person: userId
        }
        if (hirer.type === hirerTypes.ADMIN) {
          delete filters.person
        }
        return context.sql.readAll({
          type: 'intros',
          filters
        })
      }
    }
  }
}
