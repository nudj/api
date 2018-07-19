module.exports = {
  typeDefs: `
    extend type SurveySection {
      surveyQuestions: [SurveyQuestion!]!
    }
  `,
  resolvers: {
    SurveySection: {
      surveyQuestions: async (surveySection, args, context) => {
        const { surveyQuestions } = surveySection
        const questionIds = JSON.parse(surveyQuestions)
        const questions = await context.sql.readMany({
          type: 'surveyQuestions',
          ids: questionIds
        })
        const questionMap = questions.reduce((allQuestions, question) => {
          allQuestions[question.id] = question
          return allQuestions
        }, {})

        return questionIds.map(id => questionMap[id]).filter(Boolean)
      }
    }
  }
}
