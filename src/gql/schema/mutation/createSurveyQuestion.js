const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')
const { handleErrors } = require('../../lib')
const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveyQuestion(surveySection: ID!, data: SurveyQuestionCreateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Mutation: {
      createSurveyQuestion: handleErrors(async (root, args, context) => {
        const { tags = [], ...surveyQuestionData } = args.data

        const data = {
          ...surveyQuestionData,
          surveySection: args.surveySection
        }
        const slug = await makeUniqueSlug({
          type: 'surveyQuestions',
          data,
          context
        })
        const surveyQuestion = await context.sql.create({
          type: 'surveyQuestions',
          data: {
            ...data,
            slug
          }
        })

        const { surveyQuestions } = await context.sql.readOne({
          type: 'surveySections',
          id: surveyQuestion.surveySection
        })
        let surveyQuestionsArray = JSON.parse(surveyQuestions)
        surveyQuestionsArray = surveyQuestionsArray.concat(surveyQuestion.id)

        await context.sql.update({
          type: 'surveySections',
          id: surveyQuestion.surveySection,
          data: {
            surveyQuestions: JSON.stringify(surveyQuestionsArray)
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
