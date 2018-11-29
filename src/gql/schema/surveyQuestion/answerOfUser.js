module.exports = {
  typeDefs: `
    extend type SurveyQuestion {
      answerOfUser: SurveyAnswer
    }
  `,
  resolvers: {
    SurveyQuestion: {
      answerOfUser: async (surveyQuestion, args, context) => {
        return context.store.readOne({
          type: 'surveyAnswers',
          filter: {
            surveyQuestion: surveyQuestion.id,
            person: context.userId
          }
        })
      }
    }
  }
}
