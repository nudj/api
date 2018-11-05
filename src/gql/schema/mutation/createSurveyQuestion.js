const omit = require('lodash/omit')
const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveyQuestion(survey: ID!, data: SurveyQuestionCreateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Mutation: {
      createSurveyQuestion: async (root, args, context) => {
        const { data, survey } = args
        const { tags = [] } = data

        const surveyQuestion = await context.store.create({
          type: 'surveyQuestions',
          data: {
            ...omit(args.data, ['tags']),
            survey
          }
        })

        const { surveyQuestions = [] } = await context.store.readOne({
          type: 'surveys',
          id: surveyQuestion.survey
        })

        await context.store.update({
          type: 'surveys',
          id: surveyQuestion.survey,
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

        await Promise.all(surveyTags.map(tag => {
          return context.store.create({
            type: 'surveyQuestionTags',
            data: {
              surveyQuestion: surveyQuestion.id,
              tag: tag.id,
              source: tagSources.NUDJ
            }
          })
        }))

        return surveyQuestion
      }
    }
  }
}
