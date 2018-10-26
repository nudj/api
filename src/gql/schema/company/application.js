module.exports = {
  typeDefs: `
    extend type Company {
      application (id: ID!): Application
    }
  `,
  resolvers: {
    Company: {
      application: async (company, args, context) => {
        const { id: applicationId } = args

        const application = await context.store.readOne({
          type: 'applications',
          id: applicationId
        })
        if (!application) return null

        const job = await context.store.readOne({
          type: 'jobs',
          id: application.job
        })
        if (job.company !== company.id) return null

        return application
      }
    }
  }
}
