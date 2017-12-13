const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'connectionSourcesByFilters',
  type: 'ConnectionSource',
  collection: 'connectionSources',
  filterType: 'ConnectionSourceFilterInput'
})
