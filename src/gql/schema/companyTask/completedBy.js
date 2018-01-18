const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'CompanyTask',
  type: 'Person',
  collection: 'people',
  name: 'completedBy',
  propertyName: 'completedBy'
})
