module.exports = {
  typeDefs: `
    extend type SurveyQuestion {
      tags: [Tag!]
    }
  `,
  resolvers: {
    SurveyQuestion: {
      tags: async (surveyQuestion, args, context) => {
        const entityTags = await context.store.readAll({
          type: 'entityTags',
          filters: {
            entityType: 'surveyQuestion',
            entityId: surveyQuestion.id
          }
        })

        if (!entityTags || !entityTags.length) return []

        const tagIds = entityTags.map(entityTag => entityTag.tagId)
        const tags = await context.store.readMany({
          type: 'tags',
          ids: tagIds
        })

        return tags
      }
    }
  }
}
