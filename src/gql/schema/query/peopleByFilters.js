const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'peopleByFilters',
  type: 'Person',
  collection: 'people',
  filterType: 'PersonFilterInput'
})
