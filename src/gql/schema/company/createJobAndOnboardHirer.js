const omit = require('lodash/omit')

const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')
const handleErrors = require('../../lib/handle-errors')
const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')

module.exports = {
  typeDefs: `
    extend type Company {
      createJobAndOnboardHirer(data: JobCreateInput!): Job
    }
  `,
  resolvers: {
    Company: {
      createJobAndOnboardHirer: handleErrors(async (company, args, context) => {
        const { tags } = args.data
        const slug = await makeUniqueSlug({
          type: 'jobs',
          data: args.data,
          context
        })

        const job = await context.store.create({
          type: 'jobs',
          data: {
            ...omit(args.data, ['tags']),
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

        // Set hirer as onboarded
        const hirer = await context.store.readOne({
          type: 'hirers',
          filters: { person: context.userId }
        })
        await context.store.update({
          type: 'hirers',
          id: hirer.id,
          data: {
            onboarded: true
          }
        })

        return job
      })
    }
  }
}
