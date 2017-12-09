const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'employmentsByFilters',
  type: 'Employment',
  collection: 'employments',
  filterType: 'EmploymentFilterInput'
})
