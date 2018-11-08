const { nestedSingleByFilters } = require('../../lib')

module.exports = nestedSingleByFilters({
  parentType: 'Company',
  type: 'CompanyIntegration',
  name: 'integrationByFilters'
})
