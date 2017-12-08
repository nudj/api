const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'jobsByFilters',
  type: 'Job',
  collection: 'jobs',
  filterType: 'JobFilterInput'
})
