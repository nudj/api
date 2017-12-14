const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Company',
  type: 'CompanyTask',
  name: 'tasks'
})
