module.exports = {
  typeDefs: `
    extend type SurveyQuestion {
      tags: [Tag!]
    }
  `,
  resolvers: {
    SurveyQuestion: {
      tags: async (surveyQuestion, args, context) => {
        const surveyQuestionTags = await context.store.readAll({
          type: 'surveyQuestionTags',
          filters: { surveyQuestion: surveyQuestion.id }
        })

        if (!surveyQuestionTags || !surveyQuestionTags.length) return []

        const tagIds = surveyQuestionTags.map(surveyQuestionTag => surveyQuestionTag.tag)
        const tags = await context.store.readMany({
          type: 'tags',
          ids: tagIds
        })

        return tags
      }
    }
  }
}
