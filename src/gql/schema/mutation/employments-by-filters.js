const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'employmentsByFilters',
  type: 'Employment',
  collection: 'employments',
  filterType: 'EmploymentFilterInput'
})
