module.exports = {
  typeDefs: `
    extend type Company {
      createIntegration(type: CompanyIntegrationType!, data: Data!): CompanyIntegration
    }
  `,
  resolvers: {
    Company: {
      createIntegration: async (company, args, context) => {
        const { data, type } = args

        const existingIntegration = await context.sql.readOne({
          type: 'companyIntegrations',
          filters: {
            company: company.id
          }
        })

        if (existingIntegration) {
          throw new Error(`Company already has an integration of type "${existingIntegration.type}"`)
        }

        const integration = await context.sql.create({
          type: 'companyIntegrations',
          data: {
            company: company.id,
            type,
            data
          }
        })

        await context.sql.update({
          type: 'companies',
          id: company.id,
          data: {
            ats: type
          }
        })

        return integration
      }
    }
  }
}
