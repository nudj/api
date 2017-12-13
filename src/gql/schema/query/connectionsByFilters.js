const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'connectionsByFilters',
  type: 'Connection',
  collection: 'connections',
  filterType: 'ConnectionFilterInput'
})
