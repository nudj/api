const omit = require('lodash/omit')

const makeUniqueSlug = require('./make-unique-slug')
const { values: tagTypes } = require('../../schema/enums/tag-types')
const { values: tagSources } = require('../../schema/enums/tag-sources')

const createJob = async (context, company, data) => {
  const { tags } = data
  const slug = await makeUniqueSlug({
    type: 'jobs',
    data: data,
    context
  })

  const job = await context.sql.create({
    type: 'jobs',
    data: {
      ...omit(data, ['tags']),
      slug,
      company: company.id
    }
  })

  if (tags) {
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
      return context.sql.create({
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
