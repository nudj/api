const { values: integrationTypes } = require('../schema/enums/company-integration-types')
const setupGreenhouseHelper = require('./greenhouse')

module.exports = {
  [integrationTypes.GREENHOUSE]: setupGreenhouseHelper
}
