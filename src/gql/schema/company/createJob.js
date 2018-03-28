const omit = require('lodash/omit')

const handleErrors = require('../../lib/handle-errors')
const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')

module.exports = {
  typeDefs: `
    extend type Company {
      createJob(data: JobCreateInput!): Job
    }
  `,
  resolvers: {
    Company: {
      createJob: handleErrors(async (company, args, context) => {
        const existingJob = await context.store.readOne({
          type: 'jobs',
          filters: {
            company: company.id,
            slug: args.data.slug
          }
        })

        if (existingJob) {
          throw new Error(`Company \`${company.name}\` already has a job with slug \`${args.data.slug}\``)
        }

        const { tags } = args.data

        const job = await context.store.create({
          type: 'jobs',
          data: {
            ...omit(args.data, ['tags']),
            company: company.id
          }
        })

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
          return context.store.create({
            type: 'entityTags',
            data: {
              entityType: 'job',
              entityId: job.id,
              tagId: tag.id,
              sourceType: tagSources.NUDJ,
              sourceId: null
            }
          })
        }))

        return job
      })
    }
  }
}
