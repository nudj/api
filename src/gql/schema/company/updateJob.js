const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')
const { values: jobStatusTypes } = require('../enums/job-status-types')
const notifyTeamAboutJob = require('../../lib/helpers/notify-team-about-job')

module.exports = {
  typeDefs: `
    extend type Company {
      updateJob(
        id: ID!
        data: JobUpdateInput!
        notifyTeam: Boolean
      ): Job
    }
  `,
  resolvers: {
    Company: {
      updateJob: async (company, args, context) => {
        const { id, data, notifyTeam } = args
        const { tags, relatedJobs, ...jobData } = data
        const { slug } = data

        if (slug) {
          const existingJob = await context.sql.readOne({
            type: 'jobs',
            filters: {
              company: company.id,
              slug: slug
            }
          })

          if (existingJob && `${id}` !== `${existingJob.id}`) {
            throw new Error(`Company \`${company.name}\` already has a job with slug \`${slug}\``)
          }
        }

        if (tags) {
          const oldJobTags = await context.sql.readAll({
            type: 'jobTags',
            filters: { job: id }
          })

          await Promise.all(oldJobTags.map(tag => {
            return context.sql.delete({
              type: 'jobTags',
              id: tag.id
            })
          }))

          const jobTags = await Promise.all(tags.map(tag => {
            return context.sql.readOneOrCreate({
              type: 'tags',
              filters: {
                name: tag,
                type: tagTypes.EXPERTISE
              },
              data: {
                name: tag,
                type: tagTypes.EXPERTISE
              }
            })
          }))

          await Promise.all(jobTags.map(tag => {
            return context.sql.readOneOrCreate({
              type: 'jobTags',
              filters: {
                job: id,
                tag: tag.id,
                source: tagSources.NUDJ
              },
              data: {
                job: id,
                tag: tag.id,
                source: tagSources.NUDJ
              }
            })
          }))
        }

        const existingJob = await context.sql.readOne({
          type: 'jobs',
          id
        })

        const updatedJob = await context.sql.update({
          type: 'jobs',
          id,
          data: jobData
        })

        if (relatedJobs) {
          // fetch all existing relatedJobs
          const oldRelatedJobs = await context.sql.readAll({
            type: 'relatedJobs',
            filters: { from: id }
          })

          // delete all existing relatedJobs
          await Promise.all(oldRelatedJobs.map(job => {
            return context.sql.delete({
              type: 'relatedJobs',
              id: job.id
            })
          }))

          // create new relatedJobs
          await Promise.all(relatedJobs.map(jobId => {
            return context.sql.create({
              type: 'relatedJobs',
              data: {
                from: id,
                to: jobId
              }
            })
          }))
        }

        if (
          notifyTeam &&
          existingJob.status !== jobStatusTypes.PUBLISHED &&
          updatedJob.status === jobStatusTypes.PUBLISHED
        ) {
          await notifyTeamAboutJob(context, company, updatedJob)
        }

        return updatedJob
      }
    }
  }
}
