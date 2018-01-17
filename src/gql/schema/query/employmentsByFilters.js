const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'employmentsByFilters',
  type: 'Employment',
  collection: 'employments',
  filterType: 'EmploymentFilterInput'
})
