const omit = require('lodash/omit')

const makeUniqueSlug = require('./make-unique-slug')
const { random: randomSlugGenerator } = require('./slug-generators')
const { values: jobStatusTypes } = require('../../schema/enums/job-status-types')
const { values: tagTypes } = require('../../schema/enums/tag-types')
const { values: tagSources } = require('../../schema/enums/tag-sources')

const createJob = async (context, company, data) => {
  const { tags } = data
  let slug

  if (data.status === jobStatusTypes.DRAFT) {
    slug = `draft-${randomSlugGenerator()}`
  } else {
    slug = await makeUniqueSlug({
      type: 'jobs',
      data,
      context
    })
  }

  const job = await context.store.create({
    type: 'jobs',
    data: {
      ...omit(data, ['tags']),
      slug,
      company: company.id
    }
  })

  if (tags) {
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
        type: 'jobTags',
        data: {
          job: job.id,
          tag: tag.id,
          source: tagSources.NUDJ
        }
      })
    }))
  }

  return job
}

module.exports = createJob
