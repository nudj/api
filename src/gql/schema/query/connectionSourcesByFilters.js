const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'connectionSourcesByFilters',
  type: 'ConnectionSource',
  collection: 'connectionSources',
  filterType: 'ConnectionSourceFilterInput'
})
