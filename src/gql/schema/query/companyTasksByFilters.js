const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'companyTasksByFilters',
  type: 'CompanyTask',
  collection: 'companyTasks',
  filterType: 'CompanyTaskFilterInput'
})
