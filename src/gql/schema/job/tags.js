module.exports = {
  typeDefs: `
    extend type Job {
      tags: [String!]
    }
  `,
  resolvers: {
    Job: {
      tags: async (job, args, context) => {
        const jobTags = await context.store.readAll({
          type: 'jobTags',
          filters: { job: job.id }
        })

        if (!jobTags || !jobTags.length) return []

        const tagIds = jobTags.map(jobTag => jobTag.tag)
        const tags = await context.store.readMany({
          type: 'tags',
          ids: tagIds
        })

        return tags.map(tag => tag.name)
      }
    }
  }
}
