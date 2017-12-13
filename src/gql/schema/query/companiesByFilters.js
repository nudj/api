const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'companiesByFilters',
  type: 'Company',
  collection: 'companies',
  filterType: 'CompanyFilterInput'
})
