const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'companyTasks',
  type: 'CompanyTask',
  collection: 'companyTasks'
})
