const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')
const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updateSurveyQuestion (id: ID!, data: SurveyQuestionUpdateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Mutation: {
      updateSurveyQuestion: async (root, args, context) => {
        const {
          data: rawData
        } = args
        const {
          tags,
          ...data
        } = rawData

        if (data.title) {
          data.slug = await makeUniqueSlug({
            type: 'surveyQuestions',
            data,
            context
          })
        }

        if (!tags) {
          return context.store.update({
            type: 'surveyQuestions',
            id: args.id,
            data
          })
        }

        const oldSurveyQuestionTags = await context.store.readAll({
          type: 'surveyQuestionTags',
          filters: { surveyQuestion: args.id }
        })

        await Promise.all(oldSurveyQuestionTags.map(tag => {
          return context.store.delete({
            type: 'surveyQuestionTags',
            id: tag.id
          })
        }))

        const updatedTags = await Promise.all((tags || []).map(tag => {
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

        await Promise.all(updatedTags.map(tag => {
          return context.store.readOneOrCreate({
            type: 'surveyQuestionTags',
            filters: {
              surveyQuestion: args.id,
              tag: tag.id,
              source: tagSources.NUDJ
            },
            data: {
              surveyQuestion: args.id,
              tag: tag.id,
              source: tagSources.NUDJ
            }
          })
        }))

        return context.store.update({
          type: 'surveyQuestions',
          id: args.id,
          data
        })
      }
    }
  }
}
