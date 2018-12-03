const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Survey {
      createSurveyQuestion(data: SurveyQuestionCreateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Survey: {
      createSurveyQuestion: async (survey, args, context) => {
        const { data } = args

        data.slug = await makeUniqueSlug({
          type: 'surveyQuestions',
          data,
          context
        })

        const surveyQuestion = await context.store.create({
          type: 'surveyQuestions',
          data: {
            ...data,
            survey: survey.id
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

        return surveyQuestion
      }
    }
  }
}
