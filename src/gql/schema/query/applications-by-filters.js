const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'applicationsByFilters',
  type: 'Application',
  collection: 'applications',
  filterType: 'ApplicationFilterInput'
})
