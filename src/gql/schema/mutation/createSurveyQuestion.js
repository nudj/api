const omit = require('lodash/omit')
const { values: tagTypes } = require('../enums/tag-types')
const { values: expertiseTags } = require('../enums/expertise-tags')
const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveyQuestion(surveySection: ID!, data: SurveyQuestionCreateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Mutation: {
      createSurveyQuestion: handleErrors(async (root, args, context) => {
        const { tags = [] } = args.data

        tags.forEach(tag => {
          if (!expertiseTags[tag]) throw new Error(`Invalid tag '${tag}'`)
        })

        const surveyQuestion = await context.store.create({
          type: 'surveyQuestions',
          data: {
            ...omit(args.data, ['tags']),
            surveySection: args.surveySection
          }
        })

        const { surveyQuestions = [] } = await context.store.readOne({
          type: 'surveySections',
          id: surveyQuestion.surveySection
        })

        await context.store.update({
          type: 'surveySections',
          id: surveyQuestion.surveySection,
          data: {
            surveyQuestions: surveyQuestions.concat(surveyQuestion.id)
          }
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
          return context.store.create({
            type: 'entityTags',
            data: {
              entityType: 'surveyQuestion',
              entityId: surveyQuestion.id,
              tagId: tag.id,
              sourceType: 'nudj',
              sourceId: null
            }
          })
        }))

        return context.store.update({
          type: 'surveyQuestions',
          id: surveyQuestion.id,
          data: {
            tags: surveyQuestionEntityTags.map(tag => tag.id)
          }
        })
      })
    }
  }
}
