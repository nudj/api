const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'peopleByFilters',
  type: 'Person',
  collection: 'people',
  filterType: 'PersonFilterInput'
})
