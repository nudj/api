module.exports = {
  typeDefs: `
    extend type Job {
      tags: [String!]
    }
  `,
  resolvers: {
    Job: {
      tags: async (job, args, context) => {
        const entityTags = await context.store.readAll({
          type: 'entityTags',
          filters: { entityId: job.id }
        })

        if (!entityTags || !entityTags.length) return []

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
