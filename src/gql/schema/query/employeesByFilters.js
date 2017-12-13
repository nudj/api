const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'employeesByFilters',
  type: 'Employee',
  collection: 'employees',
  filterType: 'EmployeeFilterInput'
})
