const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'companyTasksByFilters',
  type: 'CompanyTask',
  collection: 'companyTasks',
  filterType: 'CompanyTaskFilterInput'
})
