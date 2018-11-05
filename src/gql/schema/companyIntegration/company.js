const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'CompanyIntegration',
  type: 'Company',
  collection: 'companies'
})
