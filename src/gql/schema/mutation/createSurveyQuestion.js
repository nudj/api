const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')
const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveyQuestion(survey: ID!, data: SurveyQuestionCreateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Mutation: {
      createSurveyQuestion: async (root, args, context) => {
        const {
          data: rawData,
          survey
        } = args
        const {
          tags = [],
          ...data
        } = rawData

        data.slug = await makeUniqueSlug({
          type: 'surveyQuestions',
          data,
          context
        })

        const surveyQuestion = await context.store.create({
          type: 'surveyQuestions',
          data: {
            ...data,
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
