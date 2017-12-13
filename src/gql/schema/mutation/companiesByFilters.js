const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'companiesByFilters',
  type: 'Company',
  collection: 'companies',
  filterType: 'CompanyFilterInput'
})
