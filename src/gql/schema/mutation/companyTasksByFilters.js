const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'companyTasksByFilters',
  type: 'CompanyTask',
  collection: 'companyTasks',
  filterType: 'CompanyTaskFilterInput'
})
