const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'hirersByFilters',
  type: 'Hirer',
  collection: 'hirers',
  filterType: 'HirerFilterInput'
})
