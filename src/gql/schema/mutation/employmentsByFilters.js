const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'employmentsByFilters',
  type: 'Employment',
  collection: 'employments',
  filterType: 'EmploymentFilterInput'
})
