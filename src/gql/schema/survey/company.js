const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Survey',
  type: 'Company',
  name: 'company',
  collection: 'companies',
  propertyName: 'company'
})
