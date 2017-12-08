const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'companyTasks',
  type: 'CompanyTask',
  collection: 'companyTasks'
})
