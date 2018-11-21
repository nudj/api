const { values: integrationTypes } = require('../schema/enums/company-integration-types')

const helpers = {
  [integrationTypes.GREENHOUSE]: require('./greenhouse')
}

function fetchIntegrationHelper ({ type, data }) {
  // This is used to provide helper methods related to the integration, such as
  // `verify` and `sync`
  return helpers[type](data)
}

module.exports = fetchIntegrationHelper
