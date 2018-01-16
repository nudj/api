const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'employeesByFilters',
  type: 'Employee',
  collection: 'employees',
  filterType: 'EmployeeFilterInput'
})
