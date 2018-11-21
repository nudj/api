const fetchIntegrationHelper = require('../../lib/fetch-integration-helper')

module.exports = {
  typeDefs: `
    extend type CompanyIntegration {
      sync: Boolean
    }
  `,
  resolvers: {
    CompanyIntegration: {
      sync: async (integration, args, context) => {
        const integrationHelper = fetchIntegrationHelper(integration)

        await integrationHelper.sync(context)
        return true
      }
    }
  }
}
