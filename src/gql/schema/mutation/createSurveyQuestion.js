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
        const { tags = [], ...data } = args.data

        data.survey = args.survey
        data.slug = await makeUniqueSlug({
          type: 'surveyQuestions',
          data,
          context
        })

        const surveyQuestion = await context.sql.create({
          type: 'surveyQuestions',
          data
        })

        const { surveyQuestions } = await context.sql.readOne({
          type: 'surveys',
          id: surveyQuestion.survey
        })
        let surveyQuestionsArray = JSON.parse(surveyQuestions)
        surveyQuestionsArray = surveyQuestionsArray.concat(surveyQuestion.id)

        await context.sql.update({
          type: 'surveys',
          id: surveyQuestion.survey,
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
      }
    }
  }
}
