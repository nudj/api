const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'personTasksByFilters',
  type: 'PersonTask',
  collection: 'personTasks',
  filterType: 'PersonTaskFilterInput'
})
