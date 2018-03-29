const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type SurveySection {
      surveyQuestions: [SurveyQuestion!]!
    }
  `,
  resolvers: {
    SurveySection: {
      surveyQuestions: handleErrors(async (surveySection, args, context) => {
        const { surveyQuestions: questionIds } = surveySection
        const questions = await context.store.readMany({
          type: 'surveyQuestions',
          ids: questionIds
        })
        const questionMap = questions.reduce((allQuestions, question) => {
          allQuestions[question.id] = question
          return allQuestions
        }, {})

        return questionIds.map(id => questionMap[id]).filter(Boolean)
      })
    }
  }
}
