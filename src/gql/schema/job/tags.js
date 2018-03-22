module.exports = {
  typeDefs: `
    extend type Job {
      tags: [String!]
    }
  `,
  resolvers: {
    Job: {
      tags: async (job, args, context) => {
        const entityTags = await context.store.readMany({
          type: 'entityTags',
          ids: job.entityTags
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
