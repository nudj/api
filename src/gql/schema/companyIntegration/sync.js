const integrationHelpers = require('../../lib/integration-helpers')

module.exports = {
  typeDefs: `
    extend type CompanyIntegration {
      sync: Boolean
    }
  `,
  resolvers: {
    CompanyIntegration: {
      sync: async (companyIntegration, args, context) => {
        const { type, data } = companyIntegration
        const integration = integrationHelpers[type](data)

        await integration.sync(context)
        return true
      }
    }
  }
}
