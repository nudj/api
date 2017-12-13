const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'employeesByFilters',
  type: 'Employee',
  collection: 'employees',
  filterType: 'EmployeeFilterInput'
})
