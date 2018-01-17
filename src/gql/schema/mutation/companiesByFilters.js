const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'companiesByFilters',
  type: 'Company',
  collection: 'companies',
  filterType: 'CompanyFilterInput'
})
