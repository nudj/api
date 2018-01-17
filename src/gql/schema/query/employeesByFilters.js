const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'employeesByFilters',
  type: 'Employee',
  collection: 'employees',
  filterType: 'EmployeeFilterInput'
})
