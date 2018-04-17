const omit = require('lodash/omit')

const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')
const handleErrors = require('../../lib/handle-errors')

module.exports = {
  typeDefs: `
    extend type Company {
      updateJob(id: ID!, data: JobUpdateInput!): Job
    }
  `,
  resolvers: {
    Company: {
      updateJob: handleErrors(async (company, args, context) => {
        const { id, data } = args
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

        if (!tags) {
          return context.store.update({
            type: 'jobs',
            id,
            data
          })
        }

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

        return context.store.update({
          type: 'jobs',
          id: args.id,
          data: omit(args.data, ['tags'])
        })
      })
    }
  }
}
