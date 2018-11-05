module.exports = {
  typeDefs: `
    extend type Survey {
      surveyQuestions: [SurveyQuestion!]!
    }
  `,
  resolvers: {
    Survey: {
      surveyQuestions: async (survey, args, context) => {
        const { surveyQuestions } = survey
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
