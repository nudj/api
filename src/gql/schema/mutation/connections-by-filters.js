const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'connectionsByFilters',
  type: 'Connection',
  collection: 'connections',
  filterType: 'ConnectionFilterInput'
})
