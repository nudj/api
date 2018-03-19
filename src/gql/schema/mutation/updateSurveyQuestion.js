const { values: tagTypes } = require('../enums/tag-types')
const { values: expertiseTags } = require('../enums/expertise-tags')
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

        tags.forEach(tag => {
          if (!expertiseTags[tag]) throw new Error(`Invalid tag '${tag}'`)
        })

        const surveyTags = await Promise.all(tags.map(tag => {
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

        const surveyQuestionEntityTags = await Promise.all(surveyTags.map(tag => {
          return context.store.readOneOrCreate({
            type: 'entityTags',
            filters: {
              entityId: args.id,
              tagId: tag.id,
              sourceType: 'nudj'
            },
            data: {
              entityType: 'surveyQuestion',
              entityId: args.id,
              tagId: tag.id,
              sourceType: 'nudj',
              sourceId: null
            }
          })
        }))

        return context.store.update({
          type: 'surveyQuestions',
          id: args.id,
          data: {
            ...args.data,
            tags: surveyQuestionEntityTags.map(tag => tag.id)
          }
        })
      })
    }
  }
}
