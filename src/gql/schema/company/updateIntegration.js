module.exports = {
  typeDefs: `
    extend type Company {
      updateIntegration(id: ID!, data: Data!): CompanyIntegration
    }
  `,
  resolvers: {
    Company: {
      updateIntegration: async (company, args, context) => {
        const { id } = args
        const integration = await context.sql.readOne({
          type: 'companyIntegrations',
          id
        })

        if (!integration) {
          throw new Error(`companyIntegration with id "${id}" does not exist`)
        }

        return context.sql.update({
          type: 'companyIntegrations',
          id,
          data: {
            data: {
              ...integration.data,
              ...args.data
            }
          }
        })
      }
    }
  }
}
