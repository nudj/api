const integrationHelpers = require('../../lib/integration-helpers')

module.exports = {
  typeDefs: `
    extend type CompanyIntegration {
      verify: Boolean
    }
  `,
  resolvers: {
    CompanyIntegration: {
      verify: async (companyIntegration, args, context) => {
        const { type, data } = companyIntegration
        const integration = integrationHelpers[type](data)

        await integration.verify()
        return true
      }
    }
  }
}
