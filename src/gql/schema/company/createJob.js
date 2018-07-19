const createJob = require('../../lib/helpers/create-job')
const { values: jobStatusTypes } = require('../enums/job-status-types')
const notifyTeamAboutJob = require('../../lib/helpers/notify-team-about-job')

module.exports = {
  typeDefs: `
    extend type Company {
      createJob(
        data: JobCreateInput!
        notifyTeam: Boolean
      ): Job
    }
  `,
  resolvers: {
    Company: {
      createJob: async (company, args, context) => {
        const {
          data,
          notifyTeam
        } = args

        const job = await createJob(context, company, data)

        if (notifyTeam && job.status === jobStatusTypes.PUBLISHED) {
          await notifyTeamAboutJob(context, company, job)
        }

        return job
      }
    }
  }
}
