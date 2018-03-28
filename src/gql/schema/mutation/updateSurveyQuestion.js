const omit = require('lodash/omit')

const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')
const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updateSurveyQuestion (id: ID!, data: SurveyQuestionUpdateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Mutation: {
      updateSurveyQuestion: handleErrors(async (root, args, context) => {
        if (!args.data.tags) {
          return context.store.update({
            type: 'surveyQuestions',
            id: args.id,
            data: args.data
          })
        }

        const { tags = [] } = args.data

        const oldSurveyQuestionTags = await context.store.readAll({
          type: 'entityTags',
          filters: { entityId: args.id }
        })

        await Promise.all(oldSurveyQuestionTags.map(tag => {
          return context.store.delete({
            type: 'entityTags',
            id: tag.id
          })
        }))

        const updatedTags = await Promise.all(tags.map(tag => {
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
            type: 'entityTags',
            filters: {
              entityId: args.id,
              tagId: tag.id,
              source: tagSources.NUDJ
            },
            data: {
              entityType: 'surveyQuestion',
              entityId: args.id,
              tagId: tag.id,
              source: tagSources.NUDJ
            }
          })
        }))

        return context.store.update({
          type: 'surveyQuestions',
          id: args.id,
          data: omit(args.data, ['tags'])
        })
      })
    }
  }
}
