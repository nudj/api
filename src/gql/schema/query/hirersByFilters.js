const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'hirersByFilters',
  type: 'Hirer',
  collection: 'hirers',
  filterType: 'HirerFilterInput'
})
