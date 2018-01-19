const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'companyTasksByFilters',
  type: 'CompanyTask',
  collection: 'companyTasks',
  filterType: 'CompanyTaskFilterInput'
})
