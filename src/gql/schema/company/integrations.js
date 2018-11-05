const { nestedAll } = require('../../lib')

module.exports = nestedAll({
  parentType: 'Company',
  type: 'CompanyIntegration',
  name: 'integrations'
})
