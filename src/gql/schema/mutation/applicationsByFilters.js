const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'applicationsByFilters',
  type: 'Application',
  collection: 'applications',
  filterType: 'ApplicationFilterInput'
})
