const fetchIntegrationHelper = require('../../lib/fetch-integration-helper')

module.exports = {
  typeDefs: `
    extend type CompanyIntegration {
      verify: Boolean
    }
  `,
  resolvers: {
    CompanyIntegration: {
      verify: async (integration, args, context) => {
        const integrationHelper = fetchIntegrationHelper(integration)

        await integrationHelper.verify()
        return true
      }
    }
  }
}
