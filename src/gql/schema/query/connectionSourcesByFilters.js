const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'sourcesByFilters',
  type: 'Source',
  collection: 'sources',
  filterType: 'SourceFilterInput'
})
