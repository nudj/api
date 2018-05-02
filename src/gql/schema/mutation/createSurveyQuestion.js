const omit = require('lodash/omit')
const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')
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

        const surveyQuestion = await context.sql.create({
          type: 'surveyQuestions',
          data: {
            ...omit(args.data, ['tags']),
            surveySection: args.surveySection
          }
        })

        const { surveyQuestions = [] } = await context.sql.readOne({
          type: 'surveySections',
          id: surveyQuestion.surveySection
        })

        await context.sql.update({
          type: 'surveySections',
          id: surveyQuestion.surveySection,
          data: {
            surveyQuestions: surveyQuestions.concat(surveyQuestion.id)
          }
        })

        const surveyTags = await Promise.all(tags.map(tag => {
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

        await Promise.all(surveyTags.map(tag => {
          return context.sql.create({
            type: 'surveyQuestionTags',
            data: {
              surveyQuestion: surveyQuestion.id,
              tag: tag.id,
              source: tagSources.NUDJ
            }
          })
        }))

        return surveyQuestion
      })
    }
  }
}
