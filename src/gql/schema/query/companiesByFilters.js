const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'companiesByFilters',
  type: 'Company',
  collection: 'companies',
  filterType: 'CompanyFilterInput'
})
