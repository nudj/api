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
        const hirer = await context.store.readOne({
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
        return context.store.readAll({
          type: 'intros',
          filters
        })
      }
    }
  }
}
