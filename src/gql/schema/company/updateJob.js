const omit = require('lodash/omit')

const { makeUniqueSlug } = require('../../lib/helpers')
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
        const { tags, slug } = data

        if (slug) {
          const existingJob = await context.store.readOne({
            type: 'jobs',
            filters: {
              company: company.id,
              slug: slug
            }
          })

          if (existingJob && id !== existingJob.id) {
            throw new Error(`Company \`${company.name}\` already has a job with slug \`${slug}\``)
          }
        }

        if (tags) {
          const oldJobTags = await context.store.readAll({
            type: 'jobTags',
            filters: { job: id }
          })

          await Promise.all(oldJobTags.map(tag => {
            return context.store.delete({
              type: 'jobTags',
              id: tag.id
            })
          }))

          const jobTags = await Promise.all(tags.map(tag => {
            return context.store.readOneOrCreate({
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
            return context.store.readOneOrCreate({
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

        const existingJob = await context.store.readOne({
          type: 'jobs',
          id
        })

        // when moving from draft to published/archived status
        // make sure to generate a final public ready slug
        if (existingJob.status === jobStatusTypes.DRAFT && data.status && data.status !== jobStatusTypes.DRAFT) {
          data.slug = await makeUniqueSlug({
            type: 'jobs',
            data: { title: existingJob.title },
            context
          })
        }

        const updatedJob = await context.store.update({
          type: 'jobs',
          id,
          data: omit(data, ['tags'])
        })

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
