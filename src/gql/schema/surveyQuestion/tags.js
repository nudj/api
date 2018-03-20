module.exports = {
  typeDefs: `
    extend type SurveyQuestion {
      tags: [ID!]
    }
  `,
  resolvers: {
    SurveyQuestion: {
      tags: async (surveyQuestion, args, context) => {
        const entityTags = await context.store.readMany({
          type: 'entityTags',
          ids: surveyQuestion.tags
        })

        const tagIds = entityTags.map(entityTag => entityTag.tagId)
        const tags = await context.store.readMany({
          type: 'tags',
          ids: tagIds
        })

        return tags.map(tag => tag.name)
      }
    }
  }
}
