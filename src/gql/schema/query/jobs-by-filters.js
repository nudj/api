const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'jobsByFilters',
  type: 'Job',
  collection: 'jobs',
  filterType: 'JobFilterInput'
})
