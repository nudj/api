const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'sourcesByFilters',
  type: 'Source',
  collection: 'sources',
  filterType: 'SourceFilterInput'
})
